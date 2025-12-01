import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, TextInput } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import AppText from "./common/AppText";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface AnswerBoxesProps {
  keyword: string;
  onAnswerChange?: (value: string) => void;
  resetKey: number;
}

interface SlotMeta {
  isSpace: boolean;
  char: string;
  key: string;
}

const BOX_SIZE = 40;

const AnswerBoxes: React.FC<AnswerBoxesProps> = ({
  keyword,
  onAnswerChange,
  resetKey,
}) => {
  const theme = useTheme();

  const slots = useMemo<SlotMeta[]>(
    () =>
      keyword.split("").map((char, index) => ({
        isSpace: char === " ",
        char,
        key: `${keyword}-${index}`,
      })),
    [keyword]
  );

  const [values, setValues] = useState<string[]>(
    slots.map((slot) => (slot.isSpace ? " " : ""))
  );

  useEffect(() => {
    setValues(slots.map((slot) => (slot.isSpace ? " " : "")));
  }, [resetKey, slots]);

  useEffect(() => {
    onAnswerChange?.(values.join(""));
  }, [onAnswerChange, values]);

  const handleChange = (text: string, index: number) => {
    const cleanChar = text.replace(/\s/g, "").slice(-1);
    setValues((prev) => {
      const next = [...prev];
      next[index] = cleanChar;
      return next;
    });
  };

  return (
    <Surface elevation={0} style={styles.wrapper}>
      {slots.map((slot, index) => {
        if (slot.isSpace) {
          return <View key={slot.key} style={{ width: BOX_SIZE * 0.15 }} />;
        }
        if (slot.char && (slot.char === "." || slot.char === "·")) {
          return (
            <View
              key={slot.key}
              style={[styles.punctuation, { width: BOX_SIZE * 0.15 }]}
            >
              <AppText
                style={{
                  color: theme.colors.onSurface,
                  fontSize: typography.sizes.md,
                }}
              >
                {slot.char}
              </AppText>
            </View>
          );
        }

        return (
          <View
            key={slot.key}
            style={{ width: BOX_SIZE * 0.75, height: BOX_SIZE }}
          >
            <TextInput
              style={{
                width: BOX_SIZE * 0.75,
                height: BOX_SIZE,
                borderWidth: 1,
                borderColor: values[index]
                  ? theme.colors.primary
                  : theme.colors.outline,
                borderRadius: 4,
                textAlign: "center",
                fontSize: typography.sizes.lg,
                color: theme.colors.onSurface,
                backgroundColor: theme.colors.surface,
                padding: 0,
              }}
              maxLength={1}
              value={values[index] || ""}
              onChangeText={(text) => handleChange(text, index)}
            />
          </View>
        );
      })}
    </Surface>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: spacing.sm,
    rowGap: spacing.md,
    justifyContent: "center",
  },
  box: {
    textAlign: "center",
  },
  punctuation: {
    height: BOX_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AnswerBoxes;
