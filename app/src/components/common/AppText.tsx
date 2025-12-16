import React from "react";
import { Text as PaperText, TextProps } from "react-native-paper";
import { Platform, TextStyle, StyleSheet, StyleProp, useWindowDimensions } from "react-native";

interface AppTextProps extends TextProps<string> {
  style?: StyleProp<TextStyle>;
}

const AppText: React.FC<AppTextProps> = ({ style, children, ...props }) => {
  // Flatten style to access properties
  const flattenedStyle = StyleSheet.flatten(style) || {};
  
  // Determine font family based on fontWeight
  let fontFamily = "NotoSansKR-400"; // Default
  const fontWeight = flattenedStyle.fontWeight;

  if (fontWeight) {
    if (["700", "800", "900", "bold"].includes(fontWeight.toString())) {
      fontFamily = "NotoSansKR-800";
    } else if (["500", "600", "medium", "semibold"].includes(fontWeight.toString())) {
      fontFamily = "NotoSansKR-600";
    } else if (["100", "200", "300", "light"].includes(fontWeight.toString())) {
      fontFamily = "NotoSansKR-200";
    }
    // For normal/400, keep default (NotoSansKR-400)
  } else if (flattenedStyle.fontFamily) {
      // If fontFamily is explicitly set, use it
      fontFamily = flattenedStyle.fontFamily;
  }

  // Override style to use fontFamily and remove fontWeight (to avoid system font fallback)
  const computedStyle: TextStyle = {
    ...flattenedStyle,
    fontFamily,
    fontWeight: undefined, // Remove fontWeight so RN uses the font family
  };

  // Android text break strategy for better Korean word wrapping and layout
  const androidProps = Platform.OS === "android" ? { textBreakStrategy: "simple" as const } : {};

  if (Platform.OS === "android") {
    computedStyle.includeFontPadding = false; // Fix vertical alignment issues on Android
  }

  const { fontScale } = useWindowDimensions();

  return (
    <PaperText
      {...props}
      {...androidProps}
      // If system font scale is small (<1), disable scaling to enforce minimum size 1.0
      // If scale is large, allow scaling but cap it at 1.2 via maxFontSizeMultiplier
      allowFontScaling={fontScale >= 1}
      maxFontSizeMultiplier={1.2}
      style={computedStyle}
    >
      {children}
    </PaperText>
  );
};

export default AppText;
