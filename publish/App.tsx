import React from 'react';
import { useColorScheme, Pressable, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackHeaderProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Appbar, PaperProvider, useTheme } from 'react-native-paper';
import HeadIcon from './assets/head.svg';
import HomeScreen from './src/screens/HomeScreen';
import KeywordListScreen from './src/screens/KeywordListScreen';
import QuizScreen from './src/screens/QuizScreen';
import KeywordEraQuizScreen from './src/screens/KeywordEraQuizScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { QuizProvider } from './src/context/QuizContext';
import { EraQuizProvider } from './src/context/EraQuizContext';
import { ThemePreferenceProvider, useThemePreference } from './src/context/ThemePreferenceContext';
import { RootStackParamList } from './src/types/navigation';
import { darkTheme, lightTheme } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const NavigationHeader: React.FC<NativeStackHeaderProps> = ({ navigation, route, options }) => {
  const theme = useTheme();
  const isHome = route.name === 'Home';
  const iconColor = theme.dark ? '#FFFFFF' : undefined;

  if (isHome) {
    return (
      <Appbar.Header elevated theme={theme}>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => (navigation as NativeStackNavigationProp<RootStackParamList>).navigate('Home')}
          style={{ width: 120, justifyContent: 'center', alignItems: 'center' }}
        >
          <HeadIcon width={100} fill={iconColor} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Appbar.Action
            icon="cog"
            onPress={() => (navigation as NativeStackNavigationProp<RootStackParamList>).navigate('Settings')}
          />
        </View>
      </Appbar.Header>
    );
  }

  return (
    <Appbar.Header elevated theme={theme}>
      <Appbar.BackAction onPress={() => navigation.goBack()} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Pressable
          onPress={() => (navigation as NativeStackNavigationProp<RootStackParamList>).navigate('Home')}
          style={{ width: 120, justifyContent: 'center', alignItems: 'center' }}
        >
          <HeadIcon width={100} fill={iconColor} />
        </Pressable>
      </View>
      <Appbar.Action
        icon="cog"
        onPress={() => (navigation as NativeStackNavigationProp<RootStackParamList>).navigate('Settings')}
      />
    </Appbar.Header>
  );
};

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: (props) => <NavigationHeader {...props} />
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
      <Stack.Screen name="KeywordList" component={KeywordListScreen} options={{ title: '키워드 목록' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: '키워드 문제' }} />
      <Stack.Screen name="KeywordEraQuiz" component={KeywordEraQuizScreen} options={{ title: '키워드 시대' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '설정' }} />
    </Stack.Navigator>
  </NavigationContainer>
);

const ThemedApp: React.FC = () => {
  const scheme = useColorScheme();
  const { preference, isReady } = useThemePreference();
  const resolvedPreference = preference === 'system' ? scheme ?? 'light' : preference;
  const currentTheme = resolvedPreference === 'dark' ? darkTheme : lightTheme;

  if (!isReady) {
    return null;
  }

  return (
    <PaperProvider theme={currentTheme}>
      <QuizProvider>
        <EraQuizProvider>
          <AppNavigator />
        </EraQuizProvider>
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
