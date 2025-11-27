import React, { useEffect } from "react";
import { useColorScheme, View, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Appbar, PaperProvider, useTheme, Text } from "react-native-paper";
import HomeScreen from "./src/screens/HomeScreen";
import KeywordListScreen from "./src/screens/KeywordListScreen";
import QuizScreen from "./src/screens/QuizScreen";
import KeywordEraQuizScreen from "./src/screens/KeywordEraQuizScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import KeywordDetailScreen from "./src/screens/KeywordDetailScreen";
import { QuizProvider } from "./src/context/QuizContext";
import { NewWordEraQuizProvider } from "./src/context/NewWordEraQuizContext";
import {
  ThemePreferenceProvider,
  useThemePreference,
} from "./src/context/ThemePreferenceContext";
import { RootStackParamList } from "./src/types/navigation";
import { darkTheme, lightTheme } from "./src/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

const getScreenTitle = (routeName: string): string => {
  switch (routeName) {
    case "Home":
      return "한능검 키워드 공부";
    case "KeywordList":
      return "한국사 키워드";
    case "Quiz":
      return "키워드 퀴즈";
    case "KeywordEraQuizScreen":
      return "한국사 시대 퀴즈";
    case "KeywordDetail":
      return "키워드 정보";
    case "Settings":
      return "설정";
    default:
      return "한국사 키워드 학습1";
  }
};

const NavigationHeader: React.FC<NativeStackHeaderProps> = ({
  navigation,
  route,
  options,
}) => {
  const theme = useTheme();
  const isHome = route.name === "Home";
  const isKeywordList = route.name === "KeywordList";
  const title = getScreenTitle(route.name);

  if (isHome) {
    return (
      <Appbar.Header
        mode="small"
        style={{ backgroundColor: theme.colors.background }}
      >
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text
            variant="titleLarge"
            style={{ fontWeight: "bold", color: theme.colors.onSurface }}
          >
            {title}
          </Text>
        </View>
      </Appbar.Header>
    );
  }

  return (
    <Appbar.Header
      mode="small"
      style={{ backgroundColor: theme.colors.background }}
    >
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          left: 0,
          right: 0,
          pointerEvents: "none",
        }}
      >
        <Text
          variant="titleLarge"
          style={{ fontWeight: "bold", color: theme.colors.onSurface }}
        >
          {title}
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      {isKeywordList ? (
        <View style={{ flexDirection: "row" }}>
          <Appbar.Action
            icon="magnify"
            onPress={() => {
              const params = route.params as any;
              if (params?.toggleSearch) {
                params.toggleSearch();
              }
            }}
          />
          <Appbar.Action
            icon="sort"
            onPress={() => {
              const params = route.params as any;
              if (params?.toggleSortDialog) {
                params.toggleSortDialog();
              }
            }}
          />
        </View>
      ) : (
        <View style={{ width: 48 }} />
      )}
    </Appbar.Header>
  );
};

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: (props) => <NavigationHeader {...props} />,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "홈" }}
      />
      <Stack.Screen
        name="KeywordList"
        component={KeywordListScreen}
        options={{ title: "키워드 목록" }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ title: "키워드 문제" }}
      />
      <Stack.Screen
        name="KeywordEraQuizScreen"
        component={KeywordEraQuizScreen}
        options={{ title: "키워드 시대" }}
      />
      <Stack.Screen
        name="KeywordDetail"
        component={KeywordDetailScreen}
        options={{ title: "키워드 정보" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "설정" }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const ThemedApp: React.FC = () => {
  const colorScheme = useColorScheme();
  const { preference, isReady } = useThemePreference();

  // Add global CSS for Korean word-break on web
  useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.innerHTML = `
        * {
          word-break: keep-all;
          overflow-wrap: break-word;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const resolvedPreference =
    preference === "system" ? colorScheme ?? "light" : preference;
  const currentTheme = resolvedPreference === "dark" ? darkTheme : lightTheme;

  if (!isReady) {
    return null;
  }

  return (
    <PaperProvider theme={currentTheme}>
      <QuizProvider>
        <NewWordEraQuizProvider>
          <AppNavigator />
        </NewWordEraQuizProvider>
      </QuizProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ThemePreferenceProvider>
      <ThemedApp />
    </ThemePreferenceProvider>
  );
}
