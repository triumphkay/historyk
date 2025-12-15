import React, { useEffect } from "react";
import { View, Platform, TouchableOpacity } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackHeaderProps,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Appbar, PaperProvider, Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeProvider } from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import {
  NotoSansKR_200ExtraLight,
  NotoSansKR_400Regular,
  NotoSansKR_600SemiBold,
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
import { useAppTheme } from "./src/hooks/useAppTheme";
import texts from "./assets/texts.json";

const Stack = createNativeStackNavigator<RootStackParamList>();

const getScreenTitle = (routeName: string): string => {
  switch (routeName) {
    case "Home":
      return texts.subTitle;
    case "KeywordList":
      return texts.keywordList.headTitle;
    case "Quiz":
      return texts.keywordQuiz.headTitle;
    case "KeywordEraQuizScreen":
      return texts.timelinedQuiz.headTitle;
    case "KeywordDetail":
      return texts.keywordDetails.headTitle;
    case "Settings":
      return texts.settings.headTitle;
    default:
      return texts.subTitle;
  }
};

const NavigationHeader: React.FC<NativeStackHeaderProps> = ({
  navigation,
  route,
  options,
}) => {
  const theme = useAppTheme();
  const isHome = route.name === "Home";
  const isKeywordList = route.name === "KeywordList";
  const title = getScreenTitle(route.name);



  if (isHome) {
    return null;
  }

  return (
    <LinearGradient
      colors={[theme.colors.level4, theme.colors.level4]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ width: "100%" }}
    >
      <Appbar.Header mode="small" style={{ backgroundColor: "transparent" }}>
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
          <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
            {title}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        {isKeywordList ? (
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => {
                const params = route.params as any;
                if (params?.toggleSearch) {
                  params.toggleSearch();
                }
              }}
              style={{
                width: 48,
                height: 48,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name={
                  (route.params as any)?.isSearchVisible
                    ? "magnify-close"
                    : "magnify"
                }
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
            {/* <Appbar.Action
              icon="sort"
              onPress={() => {
                const params = route.params as any;
                if (params?.toggleSortDialog) {
                  params.toggleSortDialog();
                }
              }}
            /> */}
          </View>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </Appbar.Header>
    </LinearGradient>
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
        options={{ title: texts.main.headTitle }}
      />
      <Stack.Screen
        name="KeywordList"
        component={KeywordListScreen}
        options={{ title: texts.keywordList.headTitle }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
        options={{ title: texts.keywordQuiz.headTitle }}
      />
      <Stack.Screen
        name="KeywordEraQuizScreen"
        component={KeywordEraQuizScreen}
        options={{ title: texts.timelinedQuiz.headTitle }}
      />
      <Stack.Screen
        name="KeywordDetail"
        component={KeywordDetailScreen}
        options={{ title: texts.keywordDetails.headTitle }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: texts.settings.headTitle }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const ThemedApp: React.FC = () => {
  const [fontsLoaded] = useFonts({
    "NotoSansKR-200": NotoSansKR_200ExtraLight,
    "NotoSansKR-400": NotoSansKR_400Regular,
    "NotoSansKR-600": NotoSansKR_600SemiBold,
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
          font-family: 'NotoSansKR-400', sans-serif;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  // Keep the splash screen visible while we fetch resources
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      // Add a 1-second delay before hiding the splash screen to ensure smooth transition
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

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
