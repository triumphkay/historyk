import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import AppText from "./common/AppText";
import { pickDisplayType } from "../utils/types";
import { TypeDetail } from "../types/TypeDetail";
import typeMetadata from "../../assets/keyword-types.json";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const typeDetails =
  (typeMetadata as { "type-set": TypeDetail[] })["type-set"] || [];

interface TypeLabelProps {
  types: string[];
  preferEraType?: boolean; // If true, prefer types ending with -시기
  useAgeQuestion?: boolean; // If true, use ageQuestion instead of question
}

const TypeLabel: React.FC<TypeLabelProps> = ({
  types,
  preferEraType = false,
  useAgeQuestion = false,
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
    if (!detail) {
      return selectedType;
    }
    // Use age-question for era quizzes if available, otherwise fall back to question
    if (useAgeQuestion && detail['age-question']) {
      return detail['age-question'];
    }
    return detail.question || selectedType;
  }, [selectedType, useAgeQuestion]);

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
    <AppText style={[styles.text, { color: theme.colors.onSurface }]}>
      {questionText}
    </AppText>
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
    fontSize: typography.sizes.xl,
    fontWeight: "600",
  },
});

export default TypeLabel;
