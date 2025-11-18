import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Button, Divider, Modal, Portal, Surface, Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatReferenceEntry } from '../utils/references';

interface ReferenceModalProps {
  visible: boolean;
  entries: string[];
  onClose: () => void;
}

const ReferenceModal: React.FC<ReferenceModalProps> = ({ visible, entries, onClose }) => {
  const theme = useTheme();

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
      >
        <Surface elevation={0} style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>출제 기록</Text>
          <Divider style={styles.divider} />
          <FlatList
            data={entries}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <Text style={[styles.entry, { color: theme.colors.onSurfaceVariant }]}>{formatReferenceEntry(item)}</Text>
            )}
            contentContainerStyle={styles.list}
          />
          <Button mode="outlined" onPress={onClose}>
            닫기
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: spacing.lg
  },
  content: {
    maxHeight: '70%',
    padding: spacing.lg,
    borderRadius: spacing.md
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold
  },
  divider: {
    marginVertical: spacing.sm
  },
  list: {
    paddingBottom: spacing.md
  },
  entry: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs
  }
});

export default ReferenceModal;
