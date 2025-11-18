import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Modal, Portal, Surface, Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface AnswerModalProps {
  visible: boolean;
  answer: string;
  onClose: () => void;
  onNext: () => void;
}

const AnswerModal: React.FC<AnswerModalProps> = ({ visible, answer, onClose, onNext }) => {
  const theme = useTheme();
  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
        >
        <Surface elevation={0} style={styles.content}>
          <Text style={[styles.answer, { color: theme.colors.onSurface }]}>{answer}</Text>
          <Button mode="outlined" onPress={onClose} style={styles.button}>
            닫기
          </Button>
          <Button mode="contained" onPress={onNext}>
            다음 문제로 넘어가기
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg
  },
  content: {
    padding: spacing.lg,
    borderRadius: spacing.md
  },
  answer: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  button: {
    marginBottom: spacing.sm
  }
});

export default AnswerModal;
