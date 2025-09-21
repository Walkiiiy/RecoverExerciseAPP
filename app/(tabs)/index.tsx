import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 模拟康复操视频数据
const exerciseVideos = [
  {
    id: '1',
    title: '上肢康复操',
    description: '适合术后早期，主要锻炼肩部和手臂',
    duration: '15分钟',
    difficulty: '初级',
    thumbnail: require('@/assets/images/icon.png'), // 使用现有图标作为占位符
    category: '上肢训练'
  },
  {
    id: '2',
    title: '肩部放松操',
    description: '缓解肩部紧张，改善血液循环',
    duration: '12分钟',
    difficulty: '初级',
    thumbnail: require('@/assets/images/icon.png'),
    category: '放松训练'
  },
  {
    id: '3',
    title: '胸部拉伸操',
    description: '增强胸部肌肉柔韧性，改善呼吸',
    duration: '18分钟',
    difficulty: '中级',
    thumbnail: require('@/assets/images/icon.png'),
    category: '拉伸训练'
  },
  {
    id: '4',
    title: '淋巴引流操',
    description: '促进淋巴循环，预防水肿',
    duration: '20分钟',
    difficulty: '中级',
    thumbnail: require('@/assets/images/icon.png'),
    category: '淋巴引流'
  }
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '初级': return '#4CAF50';
      case '中级': return '#FF9800';
      case '高级': return '#F44336';
      default: return colors.tabIconDefault;
    }
  };

  const handleStartExercise = (exerciseId: string) => {
    // 导航到跟练页面
    router.push(`/exercise/${exerciseId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>康复操跟练</ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          选择适合您的康复操视频开始跟练
        </ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.videoGrid}>
          {exerciseVideos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={[styles.videoCard, { backgroundColor: colors.background }]}
              onPress={() => handleStartExercise(video.id)}
              activeOpacity={0.7}
            >
              <View style={styles.thumbnailContainer}>
                <Image source={video.thumbnail} style={styles.thumbnail} />
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={[styles.videoTitle, { color: colors.text }]}>
                  {video.title}
                </Text>
                <Text style={[styles.videoDescription, { color: colors.tabIconDefault }]}>
                  {video.description}
                </Text>
                
                <View style={styles.cardFooter}>
                  <View style={styles.categoryContainer}>
                    <Text style={[styles.category, { color: colors.tint }]}>
                      {video.category}
                    </Text>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(video.difficulty) + '20' }]}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(video.difficulty) }]}>
                      {video.difficulty}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsContainer}>
          <ThemedText type="subtitle" style={styles.tipsTitle}>跟练小贴士</ThemedText>
          <View style={styles.tipItem}>
            <Text style={[styles.tipIcon, { color: colors.tint }]}>💡</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>
              跟练前请确保有足够的活动空间
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={[styles.tipIcon, { color: colors.tint }]}>📱</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>
              请允许摄像头权限以进行动作评估
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={[styles.tipIcon, { color: colors.tint }]}>⏰</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>
              建议每天坚持练习，循序渐进
            </Text>
          </View>
        </View>
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
  },
  videoGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  videoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: 'white',
    fontSize: 20,
    marginLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flex: 1,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipsContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});