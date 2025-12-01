import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Menu, useTheme } from "react-native-paper";
import AppText from "./common/AppText";
import { POINT_COLOR_1 } from "../theme";

interface DropdownSelectProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  value,
  options,
  onSelect,
  disabled,
}) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();
  const showIcon = !disabled;

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button
          // mode="outlined"
          onPress={() => setVisible(true)}
          disabled={disabled}
          style={[styles.dropdownButton, { borderColor: theme.colors.level5 }]}
          textColor={theme.colors.primary}
          theme={{
            colors: {
              outline: disabled
                ? theme.colors.surfaceDisabled
                : theme.colors.outline,
            },
          }}
          icon={showIcon ? "chevron-down" : undefined}
        >
          <AppText
            variant="labelLarge"
            style={{
              color: disabled || value ? POINT_COLOR_1 : theme.colors.primary,
            }}
          >
            {value || label}
          </AppText>
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
    // borderColor: "black",
    borderWidth: 1,
    borderRadius: 6,
  },
});

export default DropdownSelect;
