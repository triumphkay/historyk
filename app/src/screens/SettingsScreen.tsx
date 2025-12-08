import React from "react";
import { StyleSheet } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import AppText from "../components/common/AppText";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import texts from "../../assets/texts.json";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

const SettingsScreen: React.FC<Props> = () => {
  const theme = useTheme();

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <AppText style={[styles.title, { color: theme.colors.onSurface }]}>
        {texts.settings.headTitle}
      </AppText>
      <AppText
        style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
      >
        ---
      </AppText>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: "bold",
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    marginTop: spacing.sm,
  },
});

export default SettingsScreen;
