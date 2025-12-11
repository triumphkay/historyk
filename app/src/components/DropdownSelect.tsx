import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Button, Surface, Divider } from "react-native-paper";
import AppText from "./common/AppText";
import { POINT_COLOR_1 } from "../theme";
import { useAppTheme } from "../hooks/useAppTheme";

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
  const [menuAnchor, setMenuAnchor] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const containerRef = useRef<View>(null);
  const theme = useAppTheme();
  const showIcon = !disabled;

  const openMenu = () => {
    containerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x, y, width, height });
      setVisible(true);
    });
  };

  const closeMenu = () => setVisible(false);

  return (
    <View ref={containerRef} collapsable={false}>
      <Button
        onPress={openMenu}
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
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        <AppText
          variant="labelLarge" // This might need alignment if labelLarge is not valid variant for AppText. Checking previous code... used "labelLarge" so it's fine.
          style={{
            color: disabled || value ? POINT_COLOR_1 : theme.colors.primary,
          }}
        >
          {value || label}
        </AppText>
      </Button>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <Surface
              style={[
                styles.dropdownMenu,
                {
                  top: menuAnchor.y + menuAnchor.height + 2, // Slight offset
                  left: menuAnchor.x,
                  minWidth: menuAnchor.width,
                  backgroundColor: theme.colors.elevation.level2,
                },
              ]}
              elevation={2}
            >
              <View style={styles.menuContent}>
                <ScrollView style={{ maxHeight: 250 }}>
                  {options.map((option, index) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.menuItem}
                      onPress={() => {
                        onSelect(option);
                        closeMenu();
                      }}
                    >
                      <AppText style={{ color: theme.colors.onSurface }}>
                        {option}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Surface>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    width: 130, // Fixed width as per original Style
    // justifyContent: "center", // Button handles centering
    borderWidth: 1,
    borderRadius: 6,
    height: 40, // Enforce height for consistent native feel
  },
  buttonContent: {
    height: 40,
    // flexDirection: "row-reverse", // Optional: if icon needs to be on right, but original didn't invoke flexDirection: row-reverse. Original icon prop puts icon on left usually. Paper Button icon is left by default. The original didn't specify contentStyle reverse.
  },
  buttonLabel: {
    marginVertical: 0, // Fix vertical alignment
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdownMenu: {
    position: "absolute",
    borderRadius: 4,
    paddingVertical: 4,
  },
  menuContent: {
    borderRadius: 4,
    overflow: "hidden",
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

export default DropdownSelect;
