import React from "react";
import { FlatList, StyleSheet } from "react-native";
import {
  Button,
  Divider,
  Modal,
  Portal,
  Surface,
  useTheme,
} from "react-native-paper";
import AppText from "./common/AppText";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { formatReferenceEntry } from "../utils/references";
import texts from "../../assets/texts.json";

interface ReferenceModalProps {
  visible: boolean;
  entries: string[];
  onClose: () => void;
}

const ReferenceModal: React.FC<ReferenceModalProps> = ({
  visible,
  entries,
  onClose,
}) => {
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Surface elevation={0} style={styles.content}>
          <AppText style={[styles.title, { color: theme.colors.onSurface }]}>
            {texts.componentContents.records}
          </AppText>
          <Divider style={styles.divider} />
          <FlatList
            data={entries}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <AppText
                style={[styles.entry, { color: theme.colors.onSurfaceVariant }]}
              >
                {formatReferenceEntry(item)}
              </AppText>
            )}
            contentContainerStyle={styles.list}
          />
          <Button mode="outlined" onPress={onClose}>
            {texts.componentContents.closeText}
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: spacing.lg,
  },
  content: {
    maxHeight: "70%",
    padding: spacing.lg,
    borderRadius: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: spacing.sm,
  },
  list: {
    paddingBottom: spacing.md,
  },
  entry: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
});

export default ReferenceModal;
