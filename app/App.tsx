import React, { useEffect } from "react";
import { View, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Appbar, PaperProvider, useTheme, Text } from "react-native-paper";
import { ThemeProvider } from "styled-components/native";
import { useFonts } from "expo-font";
import {
  NotoSansKR_200ExtraLight,
  NotoSansKR_400Regular,
  NotoSansKR_800ExtraBold,
} from "@expo-google-fonts/noto-sans-kr";
import {
  NanumMyeongjo_400Regular,
  NanumMyeongjo_800ExtraBold,
} from "@expo-google-fonts/nanum-myeongjo";
import HomeScreen from "./src/screens/HomeScreen";
import KeywordListScreen from "./src/screens/KeywordListScreen";
import QuizScreen from "./src/screens/QuizScreen";
import KeywordEraQuizScreen from "./src/screens/KeywordEraQuizScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import KeywordDetailScreen from "./src/screens/KeywordDetailScreen";
import { QuizProvider } from "./src/context/QuizContext";
import { NewWordEraQuizProvider } from "./src/context/NewWordEraQuizContext";
import { RootStackParamList } from "./src/types/navigation";
import { lightTheme } from "./src/theme";
import { styledTheme } from "./src/theme/styledTheme";

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
      return "키워드";
    case "Settings":
      return "설정";
    default:
      return "한국사 키워드 학습*";
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
    return null;
  }

  return (
    <Appbar.Header
      mode="small"
      style={{ backgroundColor: theme.colors.level4 }}
      elevated
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
        <Text variant="titleLarge" style={{ color: theme.colors.level9 }}>
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
        options={{ title: "한국사 키워드" }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ title: "키워드 퀴즈" }}
      />
      <Stack.Screen
        name="KeywordEraQuizScreen"
        component={KeywordEraQuizScreen}
        options={{ title: "시대 퀴즈" }}
      />
      <Stack.Screen
        name="KeywordDetail"
        component={KeywordDetailScreen}
        options={{ title: "키워드" }}
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
  const [fontsLoaded] = useFonts({
    "NotoSansKR-200": NotoSansKR_200ExtraLight,
    "NotoSansKR-400": NotoSansKR_400Regular,
    "NotoSansKR-800": NotoSansKR_800ExtraBold,
    "NanumMyeongjo-400": NanumMyeongjo_400Regular,
    "NanumMyeongjo-800": NanumMyeongjo_800ExtraBold,
  });

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

  // Always use light theme
  const currentTheme = lightTheme;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider theme={styledTheme}>
      <PaperProvider theme={currentTheme}>
        <QuizProvider>
          <NewWordEraQuizProvider>
            <AppNavigator />
          </NewWordEraQuizProvider>
        </QuizProvider>
      </PaperProvider>
    </ThemeProvider>
  );
};

export default function App() {
  return <ThemedApp />;
}
