import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, List, SegmentedButtons, Surface, Text, useTheme, Searchbar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuiz } from '../context/QuizContext';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { QuizItem } from '../types/QuizItem';
import { getScoreFrequencyLabel } from '../utils/score';
import { loadEventData } from '../utils/dataLoader';
import keywordTypes from '../../assets/keyword-types.json';
import { EventItem } from '../types/EventItem';

type Props = NativeStackScreenProps<RootStackParamList, 'KeywordList'>;

interface KeyAgeEntry {
  nation: string;
  list: string[];
}

const keyAgeList = ((keywordTypes as { 'key-age'?: KeyAgeEntry[] })['key-age']) || [];
const groupOrderMap = new Map<string, number>();
const itemOrderMap = new Map<string, number>();

keyAgeList.forEach((entry, groupIndex) => {
  groupOrderMap.set(entry.nation, groupIndex);
  entry.list.forEach((name, itemIndex) => {
    itemOrderMap.set(name, itemIndex);
  });
});

const getEraOrder = (event: EventItem): [number, number] => {
  const groupKey = event.t_group?.[0] || '';
  const itemKey = event.t_item?.[0] || '';
  const groupOrder = groupOrderMap.get(groupKey) ?? Number.MAX_SAFE_INTEGER;
  const itemOrder = itemOrderMap.get(itemKey);
  return [groupOrder, itemOrder ?? Number.MAX_SAFE_INTEGER];
};

const KeywordListScreen: React.FC<Props> = ({ navigation }) => {
  const { problems, loading } = useQuiz();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'keyword' | 'era'>('keyword');
  const [eventItems, setEventItems] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

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

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try {
        const events = await loadEventData();
        if (mounted) {
          setEventItems(events);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) {
          setEventsLoading(false);
        }
      }
    };
    fetchEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const eraItems = useMemo(() => {
    const map = new Map<string, EventItem>();
    eventItems.forEach((event) => {
      if (!map.has(event.keyword)) {
        map.set(event.keyword, event);
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      const [groupA, itemA] = getEraOrder(a);
      const [groupB, itemB] = getEraOrder(b);
      if (groupA !== groupB) {
        return groupA - groupB;
      }
      if (itemA !== itemB) {
        return itemA - itemB;
      }
      return a.keyword.localeCompare(b.keyword, 'ko-KR');
    });
  }, [eventItems]);

  const filteredEraItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return eraItems;
    }
    const lowered = searchQuery.toLowerCase();
    return eraItems.filter((item) => item.keyword.toLowerCase().includes(lowered));
  }, [eraItems, searchQuery]);

  if (loading) {
    return (
      <Surface style={styles.center}>
        <ActivityIndicator animating color={theme.colors.primary} />
        <Text>로딩 중...</Text>
      </Surface>
    );
  }

  const renderEraItem = ({ item, index }: { item: EventItem; index: number }) => {
    const eraLabel = [item.t_group?.[0], item.t_item?.[0]].filter(Boolean).join(' ');
    const descriptionParts = [eraLabel, item.years].filter(Boolean);
    const description = descriptionParts.join(' | ');

    return (
      <List.Item
        title={item.keyword}
        description={description}
        titleNumberOfLines={1}
        descriptionNumberOfLines={1}
        style={styles.listItem}
        left={() => (
          <Surface
            elevation={0}
            style={[styles.indexBadge, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <Text style={[styles.indexText, { color: theme.colors.onPrimaryContainer }]}>
              {index + 1}
            </Text>
          </Surface>
        )}
      />
    );
  };

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
      <SegmentedButtons
        value={viewMode}
        onValueChange={(value) => setViewMode(value as 'keyword' | 'era')}
        buttons={[
          { value: 'keyword', label: `키워드(${filteredProblems.length})` },
          { value: 'era', label: `시기(${filteredEraItems.length})` }
        ]}
        style={styles.segmented}
      />
      {viewMode === 'keyword' ? (
        <FlatList
          data={filteredProblems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : eventsLoading ? (
        <Surface style={styles.placeholder}>
          <ActivityIndicator animating color={theme.colors.primary} />
        </Surface>
      ) : (
        <FlatList
          data={filteredEraItems}
          keyExtractor={(item) => item.keyword}
          renderItem={renderEraItem}
          contentContainerStyle={styles.list}
        />
      )}
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
  },
  segmented: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md
  },
  placeholder: {
    padding: spacing.md,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: typography.sizes.md,
    textAlign: 'center'
  }
});

export default KeywordListScreen;
