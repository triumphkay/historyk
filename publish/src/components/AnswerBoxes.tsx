import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, TextInput, useTheme } from 'react-native-paper';
import { spacing } from '../theme/spacing';

interface AnswerBoxesProps {
  keyword: string;
  onAnswerChange?: (value: string) => void;
  resetKey: number;
}

interface SlotMeta {
  isSpace: boolean;
  key: string;
}

const BOX_SIZE = 48;

const AnswerBoxes: React.FC<AnswerBoxesProps> = ({ keyword, onAnswerChange, resetKey }) => {
  const theme = useTheme();

  const slots = useMemo<SlotMeta[]>(
    () =>
      keyword.split('').map((char, index) => ({
        isSpace: char === ' ',
        key: `${keyword}-${index}`
      })),
    [keyword]
  );

  const [values, setValues] = useState<string[]>(slots.map((slot) => (slot.isSpace ? ' ' : '')));

  useEffect(() => {
    setValues(slots.map((slot) => (slot.isSpace ? ' ' : '')));
  }, [resetKey, slots]);

  useEffect(() => {
    onAnswerChange?.(values.join(''));
  }, [onAnswerChange, values]);

  const handleChange = (text: string, index: number) => {
    const cleanChar = text.replace(/\s/g, '').slice(-1);
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
          return <View key={slot.key} style={{ width: BOX_SIZE }} />;
        }

        return (
          <TextInput
            key={slot.key}
            mode="outlined"
            style={{ ...styles.box, width: BOX_SIZE, height: BOX_SIZE }}
            textAlign="center"
            maxLength={1}
            value={values[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            theme={theme}
          />
        );
      })}
    </Surface>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.md,
    justifyContent: 'center'
  },
  box: {
    textAlign: 'center'
  }
});

export default AnswerBoxes;
