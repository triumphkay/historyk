import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, List, Surface, Text, useTheme, Searchbar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuiz } from '../context/QuizContext';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { QuizItem } from '../types/QuizItem';
import { getScoreFrequencyLabel } from '../utils/score';

type Props = NativeStackScreenProps<RootStackParamList, 'KeywordList'>;

const KeywordListScreen: React.FC<Props> = ({ navigation }) => {
  const { problems, loading } = useQuiz();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const sortedProblems = useMemo(
    () => problems.slice().sort((a, b) => a.keyword.localeCompare(b.keyword, 'ko-KR')),
    [problems]
  );

  const filteredProblems = useMemo(() => {
    if (!searchQuery.trim()) {
      return sortedProblems;
    }
    return sortedProblems.filter((item) =>
      item.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedProblems, searchQuery]);

  if (loading) {
    return (
      <Surface style={styles.center}>
        <ActivityIndicator animating color={theme.colors.primary} />
        <Text>로딩 중...</Text>
      </Surface>
    );
  }

  const renderItem = ({ item, index }: { item: QuizItem; index: number }) => {
    const importanceLabel = getScoreFrequencyLabel(item.score);
    const descriptionCount = item.descriptions?.length || 0;
    
    return (
      <List.Item 
        title={`${item.keyword} (${descriptionCount})`} 
        description={`중요도: ${importanceLabel || '알 수 없음'}`}
        titleNumberOfLines={1} 
        style={styles.listItem}
        onPress={() => {
    navigation.navigate('KeywordDetail', { keyword: item });
  }}
        left={(props) => (
          <Surface 
            elevation={0} 
            style={[
              styles.indexBadge, 
              { backgroundColor: theme.colors.primaryContainer }
            ]}
          >
            <Text 
              style={[
                styles.indexText, 
                { color: theme.colors.onPrimaryContainer }
              ]}
            >
              {index + 1}
            </Text>
          </Surface>
        )}
      />
    );
  };

  return (
    <Surface style={styles.container}>
      <Searchbar
        placeholder="키워드 검색"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredProblems}
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
  searchBar: {
    margin: spacing.md,
    marginBottom: spacing.sm
  },
  list: {
    padding: spacing.md,
    paddingTop: 0
  },
  listItem: {
    marginBottom: spacing.xs
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  indexBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    marginRight: spacing.xs
  },
  indexText: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default KeywordListScreen;
