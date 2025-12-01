import React, { useMemo, useState, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  IconButton,
  List,
  Surface,
  Text,
  useTheme,
  Searchbar,
  Dialog,
  Portal,
  Button,
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuiz } from "../context/QuizContext";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { QuizItem } from "../types/QuizItem";
import { getScoreFrequencyLabel } from "../utils/score";
import PriorityMark from "../components/common/PriorityMark";
import { colors } from "@theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "KeywordList">;

const KeywordListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { problems, loading } = useQuiz();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [sortMode, setSortMode] = useState<"alphabetical" | "importance">(
    "alphabetical"
  );
  const [sortDialogVisible, setSortDialogVisible] = useState(false);

  // Set navigation options for search and sort buttons
  useEffect(() => {
    navigation.setParams({
      toggleSearch: () => setSearchVisible(!searchVisible),
      toggleSortDialog: () => setSortDialogVisible(true),
    } as any);
  }, [navigation, searchVisible]);

  const sortedProblems = useMemo(() => {
    if (sortMode === "importance") {
      return [...problems].sort((a, b) => {
        const scoreA = (a.score || []).reduce<number>(
          (sum, val) =>
            sum + (typeof val === "number" ? val : Number(val) || 0),
          0
        );
        const scoreB = (b.score || []).reduce<number>(
          (sum, val) =>
            sum + (typeof val === "number" ? val : Number(val) || 0),
          0
        );
        return scoreB - scoreA;
      });
    }
    return [...problems].sort((a, b) =>
      a.keyword.localeCompare(b.keyword, "ko")
    );
  }, [problems, sortMode]);

  const filteredProblems = useMemo(() => {
    if (!searchQuery.trim()) {
      return sortedProblems;
    }
    return sortedProblems.filter((problem) =>
      problem.keyword.toLowerCase().includes(searchQuery.toLowerCase())
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
    // const descriptionCount = item.descriptions?.length || 0;

    return (
      <List.Item
        title={item.keyword}
        titleStyle={[
          styles.titleText,
          { color: theme.colors.onPrimaryContainer },
        ]}
        description={() => (
          <PriorityMark
            textStyle={{ color: colors.level6 }}
            scores={item.score}
          />
        )}
        titleNumberOfLines={1}
        style={styles.listItem}
        onPress={() => {
          navigation.navigate("KeywordDetail", { keyword: item });
        }}
        left={(props) => (
          <Surface
            elevation={0}
            style={[
              styles.indexBadge,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Text style={[styles.indexText, { color: colors.level8 }]}>
              {index + 1}
            </Text>
          </Surface>
        )}
      />
    );
  };

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.level1 }]}
    >
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
        <Dialog
          visible={sortDialogVisible}
          onDismiss={() => setSortDialogVisible(false)}
        >
          <Dialog.Title>정렬 방식 선택</Dialog.Title>
          <Dialog.Content>
            <Button
              mode={sortMode === "alphabetical" ? "contained" : "outlined"}
              onPress={() => {
                setSortMode("alphabetical");
                setSortDialogVisible(false);
              }}
              style={{ marginBottom: spacing.sm }}
            >
              가나다순
            </Button>
            <Button
              mode={sortMode === "importance" ? "contained" : "outlined"}
              onPress={() => {
                setSortMode("importance");
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
    flex: 1,
  },
  countContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  titleContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  iconButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    margin: spacing.sm,
    // marginBottom: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
    // gap: 20,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.level2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  indexBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  indexText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default KeywordListScreen;
