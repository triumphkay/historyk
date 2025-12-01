import React from "react";
import { StyleSheet, View } from "react-native";
import { Surface } from "react-native-paper";
import { spacing } from "../theme/spacing";
import KeywordChip from "./KeywordChip";

interface DescriptionListProps {
  descriptions: string[];
  selected?: boolean;
  variant?: "front" | "back";
}

const DescriptionList: React.FC<DescriptionListProps> = ({
  descriptions,
  selected,
  variant = "front",
}) => {
  return (
    <Surface elevation={0} style={styles.container}>
      <View style={styles.chipRow}>
        {descriptions.map((description, index) => (
          <KeywordChip
            key={`${index}-${description.slice(0, 8)}`}
            text={description}
            variant={variant}
          />
        ))}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginVertical: spacing.lg,
    width: "100%",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: spacing.sm,
  },
});

export default DescriptionList;
