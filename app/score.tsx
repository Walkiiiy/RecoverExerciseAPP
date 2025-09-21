import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ExerciseRecord, StorageService } from '@/utils/storage';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ScoreParams {
  exerciseId: string;
  exerciseName: string;
  score: string;
  duration: string;
}

export default function ScoreScreen() {
  const params = useLocalSearchParams<ScoreParams>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const score = parseInt(params.score || '0');
  const duration = parseInt(params.duration || '0');

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50'; // 绿色
    if (score >= 80) return '#FF9800'; // 橙色
    if (score >= 70) return '#2196F3'; // 蓝色
    return '#F44336'; // 红色
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    return '需要改进';
  };

  const getScoreFeedback = (score: number) => {
    if (score >= 90) {
      return [
        '动作非常标准！',
        '节奏把握得很好',
        '继续保持这个状态',
        '建议增加练习强度'
      ];
    } else if (score >= 80) {
      return [
        '动作基本到位',
        '可以加强手臂伸展幅度',
        '注意呼吸配合',
        '整体表现良好'
      ];
    } else if (score >= 70) {
      return [
        '动作需要改进',
        '建议放慢节奏',
        '注意动作的完整性',
        '多练习基础动作'
      ];
    } else {
      return [
        '动作不够标准',
        '建议从基础动作开始',
        '注意安全，不要勉强',
        '可以寻求专业指导'
      ];
    }
  };

  const handleSaveScore = async () => {
    try {
      const scoreRecord: ExerciseRecord = {
        id: Date.now().toString(),
        exerciseId: params.exerciseId,
        exerciseName: params.exerciseName,
        score: score,
        duration: duration,
        date: new Date().toISOString().split('T')[0],
        feedback: getScoreFeedback(score)
      };

      await StorageService.saveExerciseRecord(scoreRecord);
      Alert.alert('保存成功', '您的练习记录已保存到历史记录中');
    } catch (error) {
      Alert.alert('保存失败', '无法保存练习记录，请稍后重试');
    }
  };

  const handleBackToHome = () => {
    router.push('/(tabs)');
  };

  const handleTryAgain = () => {
    router.push(`/exercise/${params.exerciseId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 分数展示区域 */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
              {score}
            </Text>
            <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>
              分
            </Text>
          </View>
          
          <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
            {getScoreText(score)}
          </Text>
          
          <Text style={[styles.exerciseName, { color: colors.text }]}>
            {params.exerciseName}
          </Text>
          
          <Text style={[styles.duration, { color: colors.tabIconDefault }]}>
            练习时长：{duration}分钟
          </Text>
        </View>

        {/* 详细反馈 */}
        <View style={[styles.feedbackSection, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={styles.feedbackTitle}>
            动作评估反馈
          </ThemedText>
          
          <View style={styles.feedbackList}>
            {getScoreFeedback(score).map((feedback, index) => (
              <View key={index} style={styles.feedbackItem}>
                <View style={[styles.feedbackIcon, { backgroundColor: getScoreColor(score) + '20' }]}>
                  <Text style={[styles.feedbackIconText, { color: getScoreColor(score) }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.feedbackText, { color: colors.text }]}>
                  {feedback}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 建议区域 */}
        <View style={[styles.suggestionsSection, { backgroundColor: colors.background }]}>
          <ThemedText type="subtitle" style={styles.suggestionsTitle}>
            练习建议
          </ThemedText>
          
          <View style={styles.suggestionItem}>
            <Text style={[styles.suggestionIcon, { color: colors.tint }]}>💪</Text>
            <Text style={[styles.suggestionText, { color: colors.text }]}>
              建议每天坚持练习，循序渐进
            </Text>
          </View>
          
          <View style={styles.suggestionItem}>
            <Text style={[styles.suggestionIcon, { color: colors.tint }]}>📅</Text>
            <Text style={[styles.suggestionText, { color: colors.text }]}>
              可以尝试不同难度的康复操
            </Text>
          </View>
          
          <View style={styles.suggestionItem}>
            <Text style={[styles.suggestionIcon, { color: colors.tint }]}>📊</Text>
            <Text style={[styles.suggestionText, { color: colors.text }]}>
              查看历史记录了解进步情况
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.tint }]}
          onPress={handleTryAgain}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>
            再练一次
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.tint }]}
          onPress={handleSaveScore}
        >
          <Text style={styles.primaryButtonText}>
            保存记录
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.background }]}
        onPress={handleBackToHome}
      >
        <Text style={[styles.backButtonText, { color: colors.tint }]}>
          返回首页
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollView: {
    flex: 1,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  duration: {
    fontSize: 16,
  },
  feedbackSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  feedbackList: {
    gap: 12,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  feedbackIconText: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedbackText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  suggestionsSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  suggestionText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    margin: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
