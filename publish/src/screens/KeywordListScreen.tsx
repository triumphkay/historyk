import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, List, Surface, Text, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuiz } from '../context/QuizContext';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { QuizItem } from '../types/QuizItem';

type Props = NativeStackScreenProps<RootStackParamList, 'KeywordList'>;

const KeywordListScreen: React.FC<Props> = () => {
  const { problems, loading } = useQuiz();
  const theme = useTheme();

  const sortedProblems = useMemo(
    () => problems.slice().sort((a, b) => a.keyword.localeCompare(b.keyword, 'ko-KR')),
    [problems]
  );

  if (loading) {
    return (
      <Surface style={styles.center}>
        <ActivityIndicator animating color={theme.colors.primary} />
        <Text>로딩 중...</Text>
      </Surface>
    );
  }

  const renderItem = ({ item, index }: { item: QuizItem; index: number }) => (
    <List.Item title={`${index + 1}. ${item.keyword}`} titleNumberOfLines={1} style={styles.listItem} />
  );

  return (
    <Surface style={styles.container}>
      <FlatList
        data={sortedProblems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  list: {
    padding: spacing.md
  },
  listItem: {
    marginBottom: spacing.xs
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default KeywordListScreen;
