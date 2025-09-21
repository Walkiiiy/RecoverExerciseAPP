import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ExerciseRecord, StorageService } from '@/utils/storage';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [historyData, setHistoryData] = useState<ExerciseRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async () => {
    try {
      const records = await StorageService.getExerciseHistory();
      setHistoryData(records);
    } catch (error) {
      console.error('加载历史数据失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistoryData();
    setRefreshing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50'; // 绿色
    if (score >= 80) return '#FF9800'; // 橙色
    return '#F44336'; // 红色
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    return '需要改进';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>历史记录</ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          查看您的康复操跟练历史
        </ThemedText>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {historyData.map((record) => (
          <TouchableOpacity
            key={record.id}
            style={[styles.recordCard, { backgroundColor: colors.background }]}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseName, { color: colors.text }]}>
                  {record.exerciseName}
                </Text>
                <Text style={[styles.date, { color: colors.tabIconDefault }]}>
                  {record.date}
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={[styles.score, { color: getScoreColor(record.score) }]}>
                  {record.score}
                </Text>
                <Text style={[styles.scoreLabel, { color: getScoreColor(record.score) }]}>
                  分
                </Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.durationContainer}>
                <Text style={[styles.durationLabel, { color: colors.tabIconDefault }]}>
                  时长：
                </Text>
                <Text style={[styles.duration, { color: colors.text }]}>
                  {record.duration}分钟
                </Text>
              </View>
              
              <View style={styles.feedbackContainer}>
                <Text style={[styles.feedbackLabel, { color: colors.tabIconDefault }]}>
                  反馈：
                </Text>
                <Text style={[styles.feedback, { color: colors.text }]}>
                  {Array.isArray(record.feedback) ? record.feedback.join('，') : record.feedback}
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getScoreColor(record.score) + '20' }]}>
                  <Text style={[styles.statusText, { color: getScoreColor(record.score) }]}>
                    {getScoreText(record.score)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {historyData.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              暂无历史记录
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
              开始您的第一次康复操跟练吧！
            </Text>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recordCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    marginLeft: 2,
  },
  cardContent: {
    gap: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  duration: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  feedbackLabel: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  feedback: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
