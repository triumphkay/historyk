import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Modal, Portal, Surface, Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface EraAnswerModalProps {
  visible: boolean;
  times: string[];
  years: string;
  onClose: () => void;
  onNext: () => void;
}

const EraAnswerModal: React.FC<EraAnswerModalProps> = ({ visible, times, years, onClose, onNext }) => {
  const theme = useTheme();
  const [group, period] = times || [];
  const trimmedGroup = (group || '').trim();
  const trimmedPeriod = (period || '').trim();
  const eraText =
    trimmedGroup && trimmedPeriod
      ? `${trimmedGroup} ${trimmedPeriod}`
      : trimmedGroup || trimmedPeriod || '정보 없음';

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Surface elevation={0} style={styles.content}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>정답</Text>
          <Text style={[styles.answer, { color: theme.colors.onSurface }]}>{eraText}</Text>
          {years ? <Text style={[styles.years, { color: theme.colors.onSurfaceVariant }]}>{years}</Text> : null}
          <Button mode="outlined" onPress={onClose} style={styles.button}>
            닫기
          </Button>
          <Button mode="contained" onPress={onNext}>
            다음 문제
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24
  },
  content: {
    padding: spacing.lg,
    borderRadius: spacing.md
  },
  label: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs
  },
  answer: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm
  },
  years: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.lg
  },
  button: {
    marginBottom: spacing.sm
  }
});

export default EraAnswerModal;
