import React from "react";
import { StyleSheet } from "react-native";
import { Button, Modal, Portal, Surface, useTheme } from "react-native-paper";
import AppText from "./common/AppText";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import texts from "../../assets/texts.json";

interface EraAnswerModalProps {
  visible: boolean;
  times: string[];
  years: string;
  onClose: () => void;
  onNext: () => void;
}

const EraAnswerModal: React.FC<EraAnswerModalProps> = ({
  visible,
  times,
  years,
  onClose,
  onNext,
}) => {
  const theme = useTheme();
  const [group, period] = times || [];
  const trimmedGroup = (group || "").trim();
  const trimmedPeriod = (period || "").trim();
  const eraText =
    trimmedGroup && trimmedPeriod
      ? `${trimmedGroup} ${trimmedPeriod}`
      : trimmedGroup || trimmedPeriod || "no data";

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Surface elevation={0} style={styles.content}>
          <AppText
            style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
          >
            {texts.componentContents.answer}
          </AppText>
          <AppText style={[styles.answer, { color: theme.colors.onSurface }]}>
            {eraText}
          </AppText>
          {years ? (
            <AppText
              style={[styles.years, { color: theme.colors.onSurfaceVariant }]}
            >
              {years}
            </AppText>
          ) : null}
          <Button mode="outlined" onPress={onClose} style={styles.button}>
            {texts.componentContents.close}
          </Button>
          <Button mode="contained" onPress={onNext}>
            {texts.componentContents.nextQuestion}
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
  },
  content: {
    padding: spacing.lg,
    borderRadius: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  answer: {
    fontSize: typography.sizes.xl,
    fontWeight: "bold",
    marginBottom: spacing.sm,
  },
  years: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.lg,
  },
  button: {
    marginBottom: spacing.sm,
  },
});

export default EraAnswerModal;
