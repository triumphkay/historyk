import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Animated, ViewStyle } from "react-native";

interface FlipCardProps {
  isFlipped: boolean;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  height?: number;
  style?: ViewStyle;
}

const FlipCard: React.FC<FlipCardProps> = ({
  isFlipped,
  frontContent,
  backContent,
  height = 360,
  style,
}) => {
  const flipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = isFlipped ? 1 : 0;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <View style={[styles.container, { height }, style]}>
      {/* Front Side */}
      <Animated.View
        style={[
          styles.flipCard,
          { transform: [{ rotateY: frontInterpolate }] },
          isFlipped && styles.flipCardFrontHidden,
        ]}
        pointerEvents={isFlipped ? "none" : "auto"}
      >
        {frontContent}
      </Animated.View>

      {/* Back Side */}
      <Animated.View
        style={[
          styles.flipCard,
          styles.flipCardBack,
          { transform: [{ rotateY: backInterpolate }] },
        ]}
        pointerEvents={isFlipped ? "auto" : "none"}
      >
        {backContent}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  flipCard: {
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  flipCardFrontHidden: {
    // Optional: hide front card when flipped if needed
  },
  flipCardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default FlipCard;
