import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Menu, Text, useTheme } from 'react-native-paper';
import { POINT_COLOR_1 } from '../theme';

interface DropdownSelectProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({ label, value, options, onSelect, disabled }) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const showIcon = !disabled;

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button
          mode="outlined"
          onPress={() => setVisible(true)}
          disabled={disabled}
          style={styles.dropdownButton}
          textColor={theme.colors.primary}
          icon={showIcon ? "chevron-down" : undefined}
        >
          <Text 
            variant="labelLarge" 
            style={{ color: (disabled || value) ? POINT_COLOR_1 : theme.colors.primary }}
          >
            {value || label}
          </Text>
        </Button>
      }
    >
      {options.map((option) => (
        <Menu.Item
          onPress={() => {
            onSelect(option);
            setVisible(false);
          }}
          title={option}
          key={option}
          titleStyle={{ color: theme.colors.onSurface }}
        />
      ))}
    </Menu>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    width: 130,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DropdownSelect;
