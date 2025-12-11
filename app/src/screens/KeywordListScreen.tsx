import React, { useMemo, useState, useEffect, useLayoutEffect } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  GestureResponderEvent,
  Keyboard,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  List,
  Surface,
  useTheme,
  Searchbar,
  Menu,
  Divider,
  Button,
} from "react-native-paper";
import AppText from "../components/common/AppText";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuiz } from "../context/QuizContext";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { QuizItem } from "../types/QuizItem";
import { getScoreFrequencyLabel } from "../utils/score";
import PriorityMark from "../components/common/PriorityMark";
import { colors } from "../theme/colors";
import texts from "../../assets/texts.json";

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

  useEffect(() => {
    navigation.setParams({
      toggleSearch: () => setSearchVisible((prev) => !prev),
    } as any);
  }, [navigation]);

  // Ref for the menu anchor
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });

  const openMenu = (event: GestureResponderEvent) => {
    event.stopPropagation();
    
    const { nativeEvent } = event;
    const anchor = { x: nativeEvent.pageX - 100, y: nativeEvent.pageY + 10 };
    setMenuAnchor(anchor);
    setMenuVisible(true);
  };

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
        <AppText>{texts.componentContents.nowLoading}</AppText>
      </Surface>
    );
  }

  const renderItem = ({ item, index }: { item: QuizItem; index: number }) => {
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
            <AppText style={[styles.indexText, { color: colors.level8 }]}>
              {index + 1}
            </AppText>
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
          placeholder={texts.keywordList.searchLabel}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      )}
      <Surface style={styles.countContainer} elevation={1}>
        <AppText style={styles.countText}>
          {filteredProblems.length}
          {texts.keywordList.keywordCount}
        </AppText>

        <Button
          mode="text"
          onPress={openMenu}
          icon="sort"
          contentStyle={{ flexDirection: "row-reverse" }}
          labelStyle={{ fontSize: 13 }}
        >
          {sortMode === "alphabetical"
            ? texts.keywordList.orderAtoZ
            : texts.keywordList.orderPriority}
        </Button>
      </Surface>

      {/* Custom Modal for robust iOS behavior */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <Surface
              style={[
                styles.customMenu,
                {
                  top: menuAnchor.y,
                  left: menuAnchor.x,
                  backgroundColor: theme.colors.elevation.level2,
                },
              ]}
              elevation={2}
            >
              <View style={styles.menuContent}>
                <Menu.Item
                  onPress={() => {
                    setSortMode("alphabetical");
                    closeMenu();
                  }}
                  title={texts.keywordList.orderAtoZ}
                  leadingIcon={
                    sortMode === "alphabetical" ? "check" : undefined
                  }
                />
                <Divider />
                <Menu.Item
                  onPress={() => {
                    setSortMode("importance");
                    closeMenu();
                  }}
                  title={texts.keywordList.orderPriority}
                  leadingIcon={sortMode === "importance" ? "check" : undefined}
                />
              </View>
            </Surface>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
    fontFamily: "NotoSansKR-800",
    marginBottom: 2,
  },
  iconButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    margin: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
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
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  customMenu: {
    position: "absolute",
    minWidth: 150,
    borderRadius: 4,
  },
  menuContent: {
    borderRadius: 4,
    overflow: "hidden",
  },
});

export default KeywordListScreen;
