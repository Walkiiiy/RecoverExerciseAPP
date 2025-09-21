import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from 'react-native';
import PythonService from '@/services/PythonService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 模拟视频数据
const exerciseData = {
  '1': {
    title: '上肢康复操',
    duration: 15 * 60, // 15分钟，单位秒
    videoUrl: require('@/assets/videos/BigBuckBunny.mp4'),
  },
  '2': {
    title: '肩部放松操',
    duration: 12 * 60,
    videoUrl: require('@/assets/videos/ElephantsDream.mp4'),
  },
  '3': {
    title: '胸部拉伸操',
    duration: 18 * 60,
    videoUrl: require('@/assets/videos/exercise.mp4'),
  },
  '4': {
    title: '淋巴引流操',
    duration: 20 * 60,
    videoUrl: require('@/assets/videos/test1.mp4'),
  },
};

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isExerciseStarted, setIsExerciseStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [exerciseScore, setExerciseScore] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedVideoPath, setRecordedVideoPath] = useState<string | null>(null);
  
  const exercise = exerciseData[id as keyof typeof exerciseData];
  const videoPlayer = useVideoPlayer(exercise?.videoUrl || '');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleStartExercise = async () => {
    if (!permission?.granted) {
      Alert.alert('需要摄像头权限', '请允许使用摄像头以进行动作评估');
      return;
    }
    
    setIsExerciseStarted(true);
    setIsRecording(true);
    
    // 开始视频播放
    videoPlayer.play();
    
    // 模拟动作评估
    startMotionAssessment();
  };

  const startMotionAssessment = async () => {
    if (Platform.OS === 'android') {
      try {
        // Start recording video
        if (cameraRef.current) {
          const recording = await cameraRef.current.recordAsync({
            quality: '720p',
            maxDuration: exercise.duration,
          });
          
          if (recording) {
            setRecordedVideoPath(recording.uri);
          }
        }
      } catch (error) {
        console.error('Error starting recording:', error);
        Alert.alert('录制错误', '无法开始录制视频');
      }
    }
    
    // Start timer
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        
        // 如果达到视频时长，结束练习
        if (newTime >= exercise.duration) {
          clearInterval(interval);
          handleFinishExercise();
        }
        
        return newTime;
      });
    }, 1000);
  };

  const handleFinishExercise = async () => {
    setIsRecording(false);
    setIsExerciseStarted(false);
    setIsProcessing(true);
    
    try {
      let finalScore = exerciseScore;
      
      // Use Python service for scoring if on Android and we have a recorded video
      if (Platform.OS === 'android' && recordedVideoPath) {
        try {
          // For now, use a default standard ID (you might want to implement standard selection)
          const standardId = 'default_standard';
          const result = await PythonService.scoreExercise(recordedVideoPath, standardId);
          finalScore = result.score;
        } catch (error) {
          console.error('Python scoring error:', error);
          // Fall back to mock score if Python service fails
          finalScore = Math.round(70 + Math.random() * 20);
        }
      } else {
        // Fall back to mock score for iOS or if no video recorded
        finalScore = Math.round(70 + Math.random() * 20);
      }
      
      // 导航到分数页面
      router.push({
        pathname: '/score',
        params: {
          exerciseId: id,
          exerciseName: exercise.title,
          score: finalScore,
          duration: Math.round(currentTime / 60), // 转换为分钟
        }
      });
    } catch (error) {
      console.error('Error finishing exercise:', error);
      Alert.alert('错误', '处理练习结果时发生错误');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopExercise = () => {
    Alert.alert(
      '结束练习',
      '确定要结束当前练习吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: handleFinishExercise }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exercise) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>练习不存在</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar hidden />
      
      {/* 视频播放区域 */}
      <View style={styles.videoContainer}>
        <VideoView
          style={styles.video}
          player={videoPlayer}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
        
        {/* 摄像头预览 */}
        {isExerciseStarted && (
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>正在录制</Text>
                </View>
              </View>
            </CameraView>
          </View>
        )}
      </View>

      {/* 控制面板 */}
      <View style={[styles.controlPanel, { backgroundColor: colors.background }]}>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseTitle, { color: colors.text }]}>
            {exercise.title}
          </Text>
          <Text style={[styles.timeText, { color: colors.tint }]}>
            {formatTime(currentTime)} / {formatTime(exercise.duration)}
          </Text>
        </View>

        {!isExerciseStarted ? (
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.tint }]}
            onPress={handleStartExercise}
          >
            <Text style={styles.startButtonText}>开始跟练</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.exerciseControls}>
            <View style={styles.scoreContainer}>
              <Text style={[styles.scoreLabel, { color: colors.tabIconDefault }]}>
                当前评分
              </Text>
              <Text style={[styles.scoreValue, { color: colors.tint }]}>
                {exerciseScore}分
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.stopButton, { backgroundColor: isProcessing ? '#999' : '#F44336' }]}
              onPress={handleStopExercise}
              disabled={isProcessing}
            >
              <Text style={styles.stopButtonText}>
                {isProcessing ? '处理中...' : '结束练习'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 进度条 */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.tabIconDefault + '30' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(currentTime / exercise.duration) * 100}%`,
                backgroundColor: colors.tint,
              },
            ]}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  cameraContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    marginRight: 6,
  },
  recordingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  controlPanel: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  exerciseControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stopButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
