/**
 * Pose-based video similarity analysis utility.
 *
 * Usage example:
 *   const { compareVideos } = require('./poseSimilarity');
 *   const score = await compareVideos('/tmp/reference.mp4', '/tmp/sample.mp4');
 *
 * Requirements:
 *   - ffmpeg binary available in PATH (or specify via options.ffmpegPath)
 *   - npm install @tensorflow/tfjs-node @tensorflow-models/pose-detection
 *
 * The main export compareVideos(videoAPath, videoBPath, options?)
 * resolves to a similarity score between 0 and 100.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { promisify } = require('util');
const { execFile } = require('child_process');

const tf = require('@tensorflow/tfjs-node');
const poseDetection = require('@tensorflow-models/pose-detection');

const execFileAsync = promisify(execFile);

function resolveDefaultFfmpegPath() {
  try {
    // Prefer bundled ffmpeg when available.
    return require('ffmpeg-static');
  } catch (error) {
    return 'ffmpeg';
  }
}

const DEFAULT_FFMPEG_PATH = resolveDefaultFfmpegPath();

let detectorPromise;

/**
 * Lazily initialize a single MoveNet detector instance.
 */
async function getDetector(detectorOptions = {}) {
  if (!detectorPromise) {
    const defaultOptions = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
    };
    detectorPromise = poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { ...defaultOptions, ...detectorOptions }
    );
  }
  return detectorPromise;
}

/**
 * Extract frames from a video file using ffmpeg.
 */
async function extractFrames(videoPath, { ffmpegPath, frameRate, maxFrames }) {
  await fs.promises.access(videoPath, fs.constants.R_OK).catch(() => {
    throw new Error(`Cannot read video at ${videoPath}`);
  });

  const tempDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'pose-frames-')
  );
  const framePattern = path.join(tempDir, 'frame_%06d.png');

  const args = ['-y', '-i', videoPath, '-vf', `fps=${frameRate}`];
  if (Number.isFinite(maxFrames) && maxFrames > 0) {
    args.push('-frames:v', String(Math.floor(maxFrames)));
  }
  args.push(framePattern);

  try {
    await execFileAsync(ffmpegPath, args);
  } catch (error) {
    await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    const message =
      error.code === 'ENOENT'
        ? `ffmpeg not found at "${ffmpegPath}". Install ffmpeg or set options.ffmpegPath.`
        : `ffmpeg failed to extract frames from ${videoPath}: ${error.message}`;
    throw new Error(message);
  }

  const frameFiles = (await fs.promises.readdir(tempDir))
    .filter((file) => file.endsWith('.png'))
    .sort()
    .map((file) => path.join(tempDir, file));

  return {
    frameDir: tempDir,
    frameFiles,
  };
}

/**
 * Run pose detection on all frames and return an array of keypoint arrays.
 */
async function detectPoses(frameFiles, detector, minPoseScore) {
  const poseData = [];

  for (const framePath of frameFiles) {
    const imageBuffer = await fs.promises.readFile(framePath);
    const imageTensor = tf.node.decodeImage(imageBuffer, 3);

    try {
      const poses = await detector.estimatePoses(imageTensor, {
        flipHorizontal: false,
      });

      if (!poses.length || !poses[0].keypoints) {
        poseData.push(null);
        continue;
      }

      const keypoints = poses[0].keypoints.map((kp) => ({
        name: kp.name,
        x: kp.x,
        y: kp.y,
        score: kp.score,
      }));

      poseData.push(
        keypoints.map((kp) => (kp.score >= minPoseScore ? kp : null))
      );
    } finally {
      imageTensor.dispose();
    }
  }

  return poseData;
}

/**
 * Compute global bounds for all valid keypoints across frames.
 */
function getGlobalBounds(poseData) {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  poseData.forEach((frame) => {
    if (!frame) {
      return;
    }
    frame.forEach((kp) => {
      if (!kp) {
        return;
      }
      xMin = Math.min(xMin, kp.x);
      xMax = Math.max(xMax, kp.x);
      yMin = Math.min(yMin, kp.y);
      yMax = Math.max(yMax, kp.y);
    });
  });

  if (
    !Number.isFinite(xMin) ||
    !Number.isFinite(xMax) ||
    !Number.isFinite(yMin) ||
    !Number.isFinite(yMax)
  ) {
    return null;
  }

  return { xMin, xMax, yMin, yMax };
}

/**
 * Normalize keypoint coordinates to [0, 1].
 */
function normalizePoseData(poseData) {
  const bounds = getGlobalBounds(poseData);
  if (!bounds) {
    return poseData.map(() => null);
  }

  const { xMin, xMax, yMin, yMax } = bounds;
  const width = xMax - xMin || 1;
  const height = yMax - yMin || 1;

  return poseData.map((frame) => {
    if (!frame) {
      return null;
    }
    return frame.map((kp) => {
      if (!kp) {
        return null;
      }
      return {
        name: kp.name,
        score: kp.score,
        x: (kp.x - xMin) / width,
        y: (kp.y - yMin) / height,
      };
    });
  });
}

function calculateEuclideanDistance(kp1, kp2) {
  return Math.sqrt(
    Math.pow(kp2.x - kp1.x, 2) + Math.pow(kp2.y - kp1.y, 2)
  );
}

/**
 * Compute similarity score between two normalized pose sequences.
 */
function calculateSimilarity(normalizedA, normalizedB) {
  const framesToCompare = Math.min(normalizedA.length, normalizedB.length);
  if (!framesToCompare) {
    return {
      score: 0,
      comparedFrames: 0,
      matchedFrames: 0,
    };
  }

  const maxDistance = Math.sqrt(2);
  let totalScore = 0;
  let matchedFrames = 0;

  for (let i = 0; i < framesToCompare; i += 1) {
    const frameA = normalizedA[i];
    const frameB = normalizedB[i];
    if (!frameA || !frameB) {
      continue;
    }

    const keypointsToCompare = Math.min(frameA.length, frameB.length);
    let frameScore = 0;
    let validKeypoints = 0;

    for (let k = 0; k < keypointsToCompare; k += 1) {
      const kpA = frameA[k];
      const kpB = frameB[k];
      if (!kpA || !kpB) {
        continue;
      }
      const distance = calculateEuclideanDistance(kpA, kpB);
      const similarity = Math.max(0, 1 - distance / maxDistance);
      frameScore += similarity;
      validKeypoints += 1;
    }

    if (validKeypoints > 0) {
      totalScore += frameScore / validKeypoints;
      matchedFrames += 1;
    }
  }

  const score =
    matchedFrames > 0 ? (totalScore / matchedFrames) * 100 : 0;

  return {
    score,
    comparedFrames: framesToCompare,
    matchedFrames,
  };
}

/**
 * Process a video into normalized pose keypoints.
 */
async function processVideo(videoPath, options) {
  const { ffmpegPath, frameRate, maxFrames, minPoseScore, detectorOptions } =
    options;

  const { frameDir, frameFiles } = await extractFrames(videoPath, {
    ffmpegPath,
    frameRate,
    maxFrames,
  });

  try {
    const detector = await getDetector(detectorOptions);
    const poseData = await detectPoses(frameFiles, detector, minPoseScore);
    return normalizePoseData(poseData);
  } finally {
    await fs.promises
      .rm(frameDir, { recursive: true, force: true })
      .catch(() => {});
  }
}

/**
 * Compare two videos and return a similarity score between 0 and 100.
 */
async function compareVideosDetailed(videoAPath, videoBPath, options = {}) {
  const config = {
    ffmpegPath: DEFAULT_FFMPEG_PATH,
    frameRate: 4,
    maxFrames: 240,
    minPoseScore: 0.3,
    detectorOptions: {},
    ...options,
  };

  if (!config.frameRate || config.frameRate <= 0) {
    throw new Error('options.frameRate must be a positive number');
  }

  const [posesA, posesB] = await Promise.all([
    processVideo(videoAPath, config),
    processVideo(videoBPath, config),
  ]);

  const result = calculateSimilarity(posesA, posesB);
  return {
    score: Number(result.score.toFixed(2)),
    comparedFrames: result.comparedFrames,
    matchedFrames: result.matchedFrames,
    frameRate: config.frameRate,
    minPoseScore: config.minPoseScore,
  };
}

async function compareVideos(videoAPath, videoBPath, options = {}) {
  const result = await compareVideosDetailed(videoAPath, videoBPath, options);
  return result.score;
}

module.exports = {
  compareVideos,
  compareVideosDetailed,
};
