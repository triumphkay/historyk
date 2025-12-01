import React, { useMemo, useState, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  List,
  Surface,
  Text,
  useTheme,
  Searchbar,
  Menu,
  Divider,
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
  const [menuVisible, setMenuVisible] = useState(false);

  // Set navigation options for search
  useEffect(() => {
    navigation.setParams({
      toggleSearch: () => setSearchVisible(!searchVisible),
    } as any);
  }, [navigation, searchVisible]);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

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
        right={(props) => (
          <List.Icon {...props} icon="chevron-right" color={colors.level4} />
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
          {filteredProblems.length}개의 키워드
        </Text>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Button
              mode="text"
              onPress={openMenu}
              icon="sort"
              contentStyle={{ flexDirection: "row-reverse" }}
              labelStyle={{ fontSize: 13 }}
            >
              {sortMode === "alphabetical" ? "가나다순" : "중요도순"}
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setSortMode("alphabetical");
              closeMenu();
            }}
            title="가나다순"
            leadingIcon={sortMode === "alphabetical" ? "check" : undefined}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setSortMode("importance");
              closeMenu();
            }}
            title="중요도순"
            leadingIcon={sortMode === "importance" ? "check" : undefined}
          />
        </Menu>
      </Surface>
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
    flex: 1,
  },
  countContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
