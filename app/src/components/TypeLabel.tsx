import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { pickDisplayType } from "../utils/types";
import { TypeDetail } from "../types/TypeDetail";
import typeMetadata from "../../assets/keyword-types.json";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const typeDetails =
  (typeMetadata as { "types-details": TypeDetail[] })["types-details"] || [];

interface TypeLabelProps {
  types: string[];
  preferEraType?: boolean; // If true, prefer types ending with -시기
}

const TypeLabel: React.FC<TypeLabelProps> = ({
  types,
  preferEraType = false,
}) => {
  const theme = useTheme();

  const selectedType = useMemo(() => {
    if (preferEraType) {
      // For era quiz, prefer types ending with -시기
      const eraType = types.find(
        (type) => type.endsWith("-시기") || type === "시기"
      );
      return eraType || pickDisplayType(types);
    }
    return pickDisplayType(types);
  }, [types, preferEraType]);

  const questionText = useMemo(() => {
    if (!selectedType) {
      return null;
    }
    const detail = typeDetails.find((item) => item.title === selectedType);
    return detail?.question || selectedType;
  }, [selectedType]);

  if (!questionText) {
    return null;
  }

  return (
    // <Surface
    //   elevation={1}
    //   style={[
    //     styles.container,
    //     // { backgroundColor: theme.colors.surfaceVariant },
    //   ]}
    // >
    // </Surface>
    <Text style={[styles.text, { color: theme.colors.onSurface }]}>
      {questionText}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    // alignSelf: "stretch",
    // paddingHorizontal: spacing.md,
    // paddingVertical: spacing.sm,
    // borderRadius: spacing.md,
    // marginBottom: spacing.sm,
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});

export default TypeLabel;
