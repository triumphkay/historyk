import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DescriptionList = ({ descriptions = [] }) => (
  <View style={styles.container}>
    {descriptions.map((description, index) => (
      <Text key={`${index}-${description.slice(0, 8)}`} style={styles.description}>
        {`${index + 1}. ${description}`}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    gap: 12
  },
  description: {
    fontSize: 16,
    lineHeight: 22
  }
});

export default DescriptionList;
