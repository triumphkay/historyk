import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuizScreen from './src/screens/QuizScreen';
import { QuizProvider } from './src/context/QuizContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <QuizProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Quiz" component={QuizScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QuizProvider>
  );
}
