import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { pickDisplayType } from '../utils/types';

const TypeLabel = ({ types = [] }) => {
  const selectedType = useMemo(() => pickDisplayType(types), [types]);

  if (!selectedType) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{selectedType}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5f0ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12
  },
  text: {
    fontSize: 14,
    fontWeight: '600'
  }
});

export default TypeLabel;
