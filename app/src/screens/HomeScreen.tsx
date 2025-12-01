import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Surface, useTheme, IconButton } from "react-native-paper";
import AppText from "../components/common/AppText";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  return (
    <Surface style={[styles.stage, { backgroundColor: theme.colors.level3 }]}>
      <LinearGradient
        colors={[theme.colors.level9, theme.colors.level8]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        {/* Settings Icon - Top Right */}
        <View style={styles.settingsButtonContainer}>
          <IconButton
            icon="cog"
            size={28}
            iconColor={theme.colors.primaryContainer}
            onPress={() => navigation.navigate("Settings")}
          />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <AppText style={[styles.title, { color: theme.colors.onPrimary }]}>
            한국사{"\n"}키워드로{"\n"}공부하기
          </AppText>

          {/* Main Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.mainButton,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              onPress={() => navigation.navigate("Quiz")}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.buttonText,
                  { color: theme.colors.onPrimaryContainer },
                ]}
              >
                키워드 퀴즈
              </AppText>
              <IconButton
                icon="arrow-right"
                size={24}
                iconColor={theme.colors.onPrimaryContainer}
                style={styles.buttonIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mainButton,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              onPress={() => navigation.navigate("KeywordEraQuizScreen")}
              activeOpacity={0.7}
            >
              <AppText
                style={[
                  styles.buttonText,
                  { color: theme.colors.onPrimaryContainer },
                ]}
              >
                한국사 시대 퀴즈
              </AppText>
              <IconButton
                icon="arrow-right"
                size={24}
                iconColor={theme.colors.onPrimaryContainer}
                style={styles.buttonIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Link */}
        <View style={styles.bottomLinkContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("KeywordList")}
            activeOpacity={0.7}
          >
            <AppText
              style={[styles.bottomLink, { color: theme.colors.onPrimary }]}
            >
              전체 키워드 보기
            </AppText>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Surface>
  );
};

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.md,
    // paddingBottom: 0,
  },
  container: {
    flex: 1,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  settingsButtonContainer: {
    alignItems: "flex-end",
  },
  content: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    paddingBottom: spacing.xxl * 2,
  },
  title: {
    fontSize: 52,
    fontFamily: "NanumMyeongjo-400",
    lineHeight: 72,
    marginBottom: spacing.xl * 2,
    textAlign: "left",
    alignSelf: "flex-start",
  },
  buttonsContainer: {
    width: "100%",
    gap: spacing.md,
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    minHeight: 60,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  buttonIcon: {
    margin: 0,
  },
  bottomLinkContainer: {
    alignItems: "center",
    // paddingBottom: spacing.lg,
  },
  bottomLink: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default HomeScreen;
