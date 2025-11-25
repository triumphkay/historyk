import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text, useTheme, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.settingsButtonContainer}>
        <IconButton
          icon="cog"
          size={24}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>한국사 키워드 학습</Text>
        <Button mode="contained" onPress={() => navigation.navigate('KeywordList')} style={styles.button}>
          키워드
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('Quiz')}>
          키워드 퀴즈
        </Button>
        <Button mode="contained" onPress={() => navigation.navigate('KeywordEraQuizScreen')}>
          한국사 시대 퀴즈
        </Button>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg
  },
  settingsButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.md
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    textAlign: 'center'
  },
  button: {
    marginBottom: spacing.sm
  }
});

export default HomeScreen;
