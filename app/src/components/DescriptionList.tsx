import React from "react";
import { StyleSheet, View } from "react-native";
import { Chip, Surface, Text, useTheme } from "react-native-paper";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface DescriptionListProps {
  descriptions: string[];
  selected?: boolean;
}

const DescriptionList: React.FC<DescriptionListProps> = ({
  descriptions,
  selected,
}) => {
  const theme = useTheme();

  return (
    <Surface elevation={0} style={styles.container}>
      <View style={styles.chipRow}>
        {descriptions.map((description, index) => (
          <Surface
            key={`${index}-${description.slice(0, 8)}`}
            elevation={1}
            style={[styles.chip, { backgroundColor: theme.colors.onGrey }]}
          >
            <Text style={[styles.chipText, { color: theme.colors.grey }]}>
              {description}
            </Text>
          </Surface>
        ))}
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
    width: "100%",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    // marginBottom: spacing.xs,
  },
  chipText: {
    fontSize: typography.sizes.lg,
    fontWeight: 600,
    // lineHeight: 22,
  },
});

export default DescriptionList;
