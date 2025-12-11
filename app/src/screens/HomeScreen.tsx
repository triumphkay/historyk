import React, { useState } from "react";
import Constants from "expo-constants";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import {
  Surface,
  useTheme,
  IconButton,
  Portal,
  Modal,
} from "react-native-paper";
import AppText from "../components/common/AppText";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import texts from "../../assets/texts.json";
import { typography } from "@theme/typography";
import { colors, POINT_COLOR_1 } from "@theme/colors";
import data from "../../assets/data.json";
import LocoMotoIcon from "../../assets/locomoto_iconiq.svg";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const titleStyle = [styles.titleText, { color: theme.colors.onPrimary }];

  return (
    <Surface style={[styles.stage, { backgroundColor: theme.colors.level3 }]}>
      <LinearGradient
        colors={[theme.colors.level9, theme.colors.level8]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={[
              styles.modalContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalTextContainer}>
                <AppText
                  style={[styles.modalAppTitle, { color: POINT_COLOR_1 }]}
                >
                  {texts.appTitle}
                </AppText>
                <AppText style={styles.modalHeader}>{texts.subTitle}</AppText>
                {texts.notice.map((line, index) => {
                  const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
                  const isMainHeader = line.startsWith("**");
                  const isSubHeader = !isMainHeader && line.includes("*");

                  return (
                    <AppText
                      key={index}
                      style={[
                        styles.modalText,
                        {
                          color: theme.colors.onSurfaceVariant,
                          marginBottom:
                            isMainHeader || isSubHeader
                              ? spacing.xs
                              : spacing.sm,
                          marginTop: isMainHeader
                            ? spacing.md
                            : isSubHeader
                            ? spacing.sm
                            : 0,
                        },
                      ]}
                    >
                      {parts.map((part, partIndex) => {
                        let isBold = false;
                        let content = part;

                        if (part.startsWith("**") && part.endsWith("**")) {
                          isBold = true;
                          content = part.slice(2, -2);
                        } else if (part.startsWith("*") && part.endsWith("*")) {
                          isBold = true;
                          content = part.slice(1, -1);
                        }

                        // Skip empty parts ensuring no extra whitespace
                        if (!content) return null;

                        return (
                          <AppText
                            key={partIndex}
                            style={{ fontWeight: isBold ? "700" : "400" }}
                          >
                            {content}
                          </AppText>
                        );
                      })}
                    </AppText>
                  );
                })}
                <View style={styles.disclaimerContainer}>
                  {texts.disclaimer.map((dis, disIndex) => (
                    <AppText
                      key={"dis" + disIndex}
                      style={styles.disclaimerText}
                    >
                      {dis}
                    </AppText>
                  ))}
                </View>
              </View>
              <View style={styles.versionText}>
                <AppText style={{ color: theme.colors.outline }}>
                  Version{" "}
                  {Constants.expoConfig?.version ||
                    Constants.manifest?.version ||
                    Constants.nativeAppVersion}
                  {" / "}
                  Dataset {data.id}
                </AppText>
              </View>

              <View style={[styles.locomoto]}>
                <LocoMotoIcon
                  width={24}
                  height={12}
                  color={theme.colors.outline}
                />
                <AppText
                  style={[styles.locomotoText, { color: theme.colors.outline }]}
                >
                  {texts.locomoto}
                </AppText>
              </View>

              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={hideModal}
              >
                <AppText
                  style={{
                    color: theme.colors.onPrimary,
                    fontWeight: "600",
                  }}
                >
                  {texts.componentContents.confirmText}
                </AppText>
              </TouchableOpacity>
            </ScrollView>
          </Modal>
        </Portal>
        {/* Settings Icon - Top Right */}
        {/* 
          [NOTE] 설정 버튼 기능은 임시적으로 비활성화되었습니다. 
          추후 설정 스크린(SettingsScreen) 기능이 다시 사용될 예정이므로 
          이 코드를 삭제하지 마십시오. (DO NOT DELETE THIS CODE)
        
        <View style={styles.settingsButtonContainer}>
          <IconButton
            icon="cog"
            size={28}
            iconColor={theme.colors.primaryContainer}
            onPress={() => navigation.navigate("Settings")}
          />
        </View>
        */}
        <View style={{ height: 40 }} />
        {/* Placeholder for spacing */}
        {/* Main Content */}

        <View style={[styles.headWrapper, { backgroundColor: POINT_COLOR_1 }]}>
          <AppText style={[styles.headTitle, { color: theme.colors.level1 }]}>
            키워드 한국사
          </AppText>
        </View>
        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <AppText style={titleStyle}>{texts.main.titleLabel[0]}</AppText>
            <AppText style={titleStyle}>{texts.main.titleLabel[1]}</AppText>
            <View style={styles.titleRow}>
              <AppText style={titleStyle}>{texts.main.titleLabel[2]}</AppText>
              <IconButton
                icon="help-circle-outline"
                size={20}
                iconColor={theme.colors.onPrimary}
                onPress={showModal}
                style={[styles.helpIcon]}
              />
            </View>
          </View>

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
                {texts.keywordQuiz.headTitle}
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
                {texts.timelinedQuiz.headTitle}
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
              {texts.main.toListTitle}
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
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.md,
    // paddingBottom: 0,
  },
  container: {
    flex: 1,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    overflow: "hidden", // Ensure border radius clips content if needed
  },
  settingsButtonContainer: {
    alignItems: "flex-end",
  },
  headWrapper: {
    height: 36,
    alignSelf: "flex-start",
    borderRadius: 18,
    marginBottom: spacing.lg,
  },
  headTitle: {
    paddingHorizontal: spacing.reg,
    fontSize: typography.sizes.lg,
    lineHeight: 36,
    fontWeight: 800,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  content: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    // paddingBottom: spacing.xxl * 2,
  },
  titleContainer: {
    alignSelf: "flex-start",
    marginBottom: spacing.xxl,
  },
  titleText: {
    fontSize: 52,
    fontFamily: "NanumMyeongjo-400",
    lineHeight: 72,
    textAlign: "left",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  helpIcon: {
    marginTop: 15, // Adjust alignment with text baseline if needed
    marginLeft: -5,
  },
  buttonsContainer: {
    width: "100%",
    gap: spacing.md,
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingVertical: spacing.xs,
    // paddingHorizontal: spacing.xl,
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    borderRadius: 30,
    minHeight: 60,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 800,
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
  // Modal Styles
  modalAppTitle: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: spacing.sm,
  },
  modalHeader: {
    fontSize: 24,
    fontFamily: "NanumMyeongjo-800",

    marginBottom: spacing.md,
  },
  modalContainer: {
    paddingVertical: spacing.lg,
    margin: spacing.lg,
    // Padding moved to scroll content to avoid clipping functionality issues with ScrollView
    borderRadius: 16,
    // maxHeight: "80%",
    maxHeight: 600,
  },
  modalScrollContent: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md, // Reduced padding to avoid excessive whitespace
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: spacing.md,
  },
  modalTextContainer: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
    width: "100%",
  },
  disclaimerContainer: {
    marginTop: 10,
  },
  disclaimerText: {
    fontSize: 12,
    marginBottom: 4,
    // fontWeight: 700,
  },
  versionText: {
    // width: "100%",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  locomoto: {
    marginBottom: spacing.xl,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  locomotoText: {
    fontSize: 10,
    // flex: 1,
    fontWeight: 500,
  },
  closeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
});

export default HomeScreen;
