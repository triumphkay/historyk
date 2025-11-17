import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const BOX_SIZE = 48;

const AnswerBoxes = ({ keyword = '', onAnswerChange, resetKey }) => {
  const slots = useMemo(
    () =>
      keyword.split('').map((char, index) => ({
        isSpace: char === ' ',
        key: `${keyword}-${index}`
      })),
    [keyword]
  );

  const [values, setValues] = useState(slots.map((slot) => (slot.isSpace ? ' ' : '')));

  useEffect(() => {
    setValues(slots.map((slot) => (slot.isSpace ? ' ' : '')));
  }, [resetKey, slots]);

  useEffect(() => {
    onAnswerChange?.(values.join(''));
  }, [onAnswerChange, values]);

  const handleChange = (text, index) => {
    const cleanChar = text.replace(/\s/g, '').slice(-1);
    setValues((prev) => {
      const next = [...prev];
      next[index] = cleanChar;
      return next;
    });
  };

  return (
    <View style={styles.wrapper}>
      {slots.map((slot, index) => {
        if (slot.isSpace) {
          return <View key={slot.key} style={styles.space} />;
        }

        return (
          <TextInput
            key={slot.key}
            style={styles.box}
            maxLength={1}
            value={values[index] || ''}
            onChangeText={(text) => handleChange(text, index)}
            autoCapitalize="none"
            autoCorrect={false}
            textAlign="center"
            keyboardType="default"
            placeholder=""
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 12,
    justifyContent: 'center'
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 6,
    fontSize: 20
  },
  space: {
    width: BOX_SIZE
  }
});

export default AnswerBoxes;
