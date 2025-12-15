import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
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
  LayoutAnimation,
  UIManager,
  InteractionManager,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  List,
  Surface,
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
import { useAppTheme } from "../hooks/useAppTheme";
import texts from "../../assets/texts.json";

type Props = NativeStackScreenProps<RootStackParamList, "KeywordList">;

const KeywordListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sortedProblems: preSortedProblems, loading } = useQuiz();
  const theme = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [sortMode, setSortMode] = useState<"alphabetical" | "importance">(
    "alphabetical"
  );
  const [menuVisible, setMenuVisible] = useState(false);

  // State to track if screen transition is complete
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for navigation animation to finish before processing data
    const task = InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });

    return () => task.cancel();
  }, []);



  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setSearchVisible((prev) => !prev);
            }}
            style={{
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name={searchVisible ? "magnify-close" : "magnify"}
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, searchVisible, theme.colors.onSurface]);

  const searchRef = useRef<any>(null);

  useEffect(() => {
    if (searchVisible) {
      // Small delay to ensure component is rendered and animation started
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    } else {
      Keyboard.dismiss();
      setSearchQuery("");
    }
  }, [searchVisible]);

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
    // If transition is not finished, return empty to speed up navigation
    if (!isReady) return [];

    // Use pre-sorted data from context
    return preSortedProblems[sortMode] || [];
  }, [preSortedProblems, sortMode, isReady]);

  const filteredProblems = useMemo(() => {
    if (!isReady) return [];
    
    if (!searchQuery.trim()) {
      return sortedProblems;
    }
    return sortedProblems.filter((problem) =>
      problem.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedProblems, searchQuery, isReady]);

  // Render Item Function
  const renderItem = ({ item, index }: { item: QuizItem; index: number }) => {
    return (
      <List.Item
        title={(props) => (
          <AppText
            style={[
              styles.titleText,
              { color: theme.colors.onPrimaryContainer },
            ]}
          >
            {item.keyword}
          </AppText>
        )}
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
              {
                backgroundColor: theme.colors.primaryContainer,
                alignSelf: "center",
              },
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
 
  // Pagination state
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Reset page when filter/sort changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortMode]);

  const displayedProblems = useMemo(() => {
    return filteredProblems.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredProblems, page]);

  const loadMore = () => {
    if (displayedProblems.length < filteredProblems.length) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading || !isReady) {
    return (
      <Surface style={styles.center}>
        <ActivityIndicator animating color={theme.colors.primary} />
        <AppText>{texts.componentContents.nowLoading}</AppText>
      </Surface>
    );
  }

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.level1 }]}
    >
      {searchVisible && (
        <View style={{ backgroundColor: theme.colors.level0 }}>
          <Searchbar
            ref={searchRef}
            placeholder={texts.keywordList.searchLabel}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={
              Platform.OS === "android"
                ? { includeFontPadding: false, textAlignVertical: "center" }
                : undefined
            }
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
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
        data={displayedProblems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={true}
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
    paddingRight: spacing.xs,
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
