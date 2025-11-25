import React, { useMemo, useState, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, List, Surface, Text, useTheme, Searchbar, Dialog, Portal, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuiz } from '../context/QuizContext';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { QuizItem } from '../types/QuizItem';
import { getScoreFrequencyLabel } from '../utils/score';

type Props = NativeStackScreenProps<RootStackParamList, 'KeywordList'>;
type SortType = 'alphabetical' | 'importance';

const KeywordListScreen: React.FC<Props> = ({ navigation }) => {
  const { problems, loading } = useQuiz();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [sortType, setSortType] = useState<SortType>('alphabetical');
  const [sortDialogVisible, setSortDialogVisible] = useState(false);

  // Expose search toggle function to parent via navigation params
  React.useLayoutEffect(() => {
    navigation.setParams({ 
      toggleSearch: () => setSearchVisible(prev => !prev),
      toggleSortDialog: () => setSortDialogVisible(true)
    } as any);
  }, [navigation]);

  const sortedProblems = useMemo(() => {
    const sorted = [...problems];
    if (sortType === 'alphabetical') {
      return sorted.sort((a, b) => a.keyword.localeCompare(b.keyword, 'ko-KR'));
    } else {
      // Sort by importance (score total)
      return sorted.sort((a, b) => {
        const scoreA = (a.score || []).reduce<number>((sum, val) => sum + (typeof val === 'number' ? val : Number(val) || 0), 0);
        const scoreB = (b.score || []).reduce<number>((sum, val) => sum + (typeof val === 'number' ? val : Number(val) || 0), 0);
        return scoreB - scoreA; // Descending order (highest first)
      });
    }
  }, [problems, sortType]);

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
      {searchVisible && (
        <Searchbar
          placeholder="키워드 검색"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      )}
      <Surface style={styles.countContainer} elevation={1}>
        <Text style={styles.countText}>
          {filteredProblems.length}개의 키워드가 있습니다
        </Text>
      </Surface>
      <FlatList
        data={filteredProblems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <Portal>
        <Dialog visible={sortDialogVisible} onDismiss={() => setSortDialogVisible(false)}>
          <Dialog.Title>정렬 방식 선택</Dialog.Title>
          <Dialog.Content>
            <Button 
              mode={sortType === 'alphabetical' ? 'contained' : 'outlined'}
              onPress={() => {
                setSortType('alphabetical');
                setSortDialogVisible(false);
              }}
              style={{ marginBottom: spacing.sm }}
            >
              가나다순
            </Button>
            <Button 
              mode={sortType === 'importance' ? 'contained' : 'outlined'}
              onPress={() => {
                setSortType('importance');
                setSortDialogVisible(false);
              }}
            >
              중요도순
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSortDialogVisible(false)}>취소</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  countContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)'
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  titleContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  iconButtons: {
    flexDirection: 'row',
    alignItems: 'center'
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
