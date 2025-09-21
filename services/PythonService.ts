import { Platform } from 'react-native';

export interface ExerciseScore {
  score: number;
  feedback: string;
  standard_name: string;
}

export interface StandardExercise {
  id: string;
  name: string;
  date: string;
}

export interface UploadResult {
  id: string;
  name: string;
  message: string;
}

class PythonServiceManager {
  /**
   * Start the Python backend service (stubbed)
   */
  async startServer(): Promise<string> {
    return `Python backend disabled (Expo local mode on ${Platform.OS}).`;
  }

  /**
   * Score an exercise video against a standard (stubbed)
   */
  async scoreExercise(videoPath: string, standardId: string): Promise<ExerciseScore> {
    return {
      score: 85,
      feedback: '本地开发模式：未连接后端，显示示例评分。',
      standard_name: standardId || 'default_standard',
    };
  }

  /**
   * Upload a standard exercise video (stubbed)
   */
  async uploadStandard(videoPath: string, exerciseName: string): Promise<UploadResult> {
    return {
      id: 'local-id',
      name: exerciseName,
      message: '本地开发模式：未连接后端，模拟上传成功。',
    };
  }

  /**
   * Get list of available standard exercises (stubbed)
   */
  async getStandards(): Promise<{ standards: StandardExercise[] }> {
    return {
      standards: [
        { id: 'default_standard', name: '示例标准动作', date: new Date().toISOString() },
      ],
    };
  }

  /**
   * Save video data to temporary file (stubbed)
   */
  async saveVideoToTemp(videoData: string, filename: string): Promise<string> {
    return `/tmp/${filename}`;
  }
}

export default new PythonServiceManager();
