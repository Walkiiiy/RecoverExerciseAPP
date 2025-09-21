import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ExerciseRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  score: number;
  duration: number;
  date: string;
  feedback: string[];
}

const STORAGE_KEY = 'exerciseHistory';

export class StorageService {
  /**
   * 保存练习记录
   */
  static async saveExerciseRecord(record: ExerciseRecord): Promise<void> {
    try {
      const existingRecords = await this.getExerciseHistory();
      const updatedRecords = [record, ...existingRecords].slice(0, 50); // 最多保留50条记录
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (error) {
      console.error('保存练习记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取练习历史记录
   */
  static async getExerciseHistory(): Promise<ExerciseRecord[]> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('获取练习历史失败:', error);
      return [];
    }
  }

  /**
   * 清除所有历史记录
   */
  static async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('清除历史记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取统计信息
   */
  static async getStatistics(): Promise<{
    totalExercises: number;
    averageScore: number;
    totalDuration: number;
    bestScore: number;
    recentExercises: ExerciseRecord[];
  }> {
    try {
      const records = await this.getExerciseHistory();
      
      if (records.length === 0) {
        return {
          totalExercises: 0,
          averageScore: 0,
          totalDuration: 0,
          bestScore: 0,
          recentExercises: [],
        };
      }

      const totalExercises = records.length;
      const averageScore = records.reduce((sum, record) => sum + record.score, 0) / totalExercises;
      const totalDuration = records.reduce((sum, record) => sum + record.duration, 0);
      const bestScore = Math.max(...records.map(record => record.score));
      const recentExercises = records.slice(0, 5); // 最近5次练习

      return {
        totalExercises,
        averageScore: Math.round(averageScore),
        totalDuration,
        bestScore,
        recentExercises,
      };
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return {
        totalExercises: 0,
        averageScore: 0,
        totalDuration: 0,
        bestScore: 0,
        recentExercises: [],
      };
    }
  }
}
