import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Surface, Divider } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useAppTheme } from "../hooks/useAppTheme";
// import { getScoreFrequencyLabel } from "../utils/score";
import { formatReferenceId } from "../utils/referenceFormatter";
import PriorityMark from "@components/common/PriorityMark";
import DescriptionList from "@components/DescriptionList";
import AppText from "@components/common/AppText";
import texts from "../../assets/texts.json";

type Props = NativeStackScreenProps<RootStackParamList, "KeywordDetail">;

const KeywordDetailScreen: React.FC<Props> = ({ route }) => {
  const theme = useAppTheme();
  const { keyword } = route.params;

  // const importanceLabel = getScoreFrequencyLabel(keyword.score);
  const occurrenceCount = keyword.ref_id.length + keyword.q_ref_id.length;

  const ExamChip = ({ id }: { id: string }) => {
    return (
      <Surface
        elevation={0}
        style={[styles.refChip, { backgroundColor: theme.colors.level3 }]}
      >
        <AppText style={[styles.refChipText, { color: theme.colors.level8 }]}>
          {formatReferenceId(id)}
        </AppText>
      </Surface>
    );
  };

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.level1 }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <AppText style={[styles.title, { color: theme.colors.primary }]}>
            {keyword.keyword}
          </AppText>
          <Surface
            elevation={0}
            style={
              [
                // styles.importanceBadge,
                // { backgroundColor: theme.colors.secondaryContainer },
              ]
            }
          >
            <PriorityMark scores={keyword.score} />
          </Surface>
        </View>

        <Divider style={styles.divider} />

        {/* Era Information Block */}
        {(keyword.era && keyword.era.length > 0) || keyword.years ? (
          <>
            <Surface
              elevation={1}
              style={[styles.eraCard, { backgroundColor: theme.colors.level3 }]}
            >
              {/* Era Script Header */}
              {keyword.era_script &&
              keyword.era_script.length > 0 &&
              keyword.era_script[0] ? (
                <AppText
                  style={[
                    styles.eraScriptTitle,
                    { color: theme.colors.level7 },
                  ]}
                >
                  {keyword.keyword} {keyword.era_script[0]}
                </AppText>
              ) : null}

              <View style={styles.eraInfoGrid}>
                <View style={styles.eraTextContainer}>
                  {[
                    ...(keyword.era || []),
                    ...(keyword.sub_era || []),
                    ...(keyword.det_era || []),
                  ]
                    .filter(Boolean)
                    .map((text, i) => (
                      <AppText
                        key={`era-text-${i}`}
                        style={[
                          styles.eraValue,
                          {
                            color: theme.colors.level8,
                            marginRight: spacing.sm,
                          },
                        ]}
                      >
                        {text}
                      </AppText>
                    ))}
                </View>

                {keyword.years ? (
                  <AppText
                    style={[
                      styles.eraYearValue,
                      {
                        color: theme.colors.level10,
                      },
                    ]}
                  >
                    {keyword.years}
                  </AppText>
                ) : null}
              </View>
            </Surface>
            <Divider style={styles.divider} />
          </>
        ) : null}

        <AppText
          style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
        >
          {texts.keywordDetails.relatedKeyword}
        </AppText>
        {keyword.descriptions && keyword.descriptions.length > 0 ? (
          <DescriptionList descriptions={keyword.descriptions} />
        ) : (
          // <Surface elevation={0} style={styles.chipsContainer}>
          //   {keyword.descriptions.map((desc, index) => (
          //     <Surface
          //       key={index}
          //       elevation={1}
          //       style={[
          //         styles.chip,
          //         { backgroundColor: theme.colors.secondaryContainer },
          //       ]}
          //     >
          //       <Text
          //         style={[
          //           styles.chipText,
          //           { color: theme.colors.onSecondaryContainer },
          //         ]}
          //       >
          //         {desc}
          //       </Text>
          //     </Surface>
          //   ))}
          // </Surface>
          <AppText
            style={[styles.noData, { color: theme.colors.onSurfaceVariant }]}
          >
            {texts.keywordDetails.NoItem}
          </AppText>
        )}

        <Divider style={styles.divider} />

        <Surface elevation={0} style={styles.infoSection}>
          <AppText
            style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
          >
            {texts.componentContents.count}
          </AppText>
          <AppText style={[styles.value, { color: theme.colors.onSurface }]}>
            {occurrenceCount}
            {texts.componentContents.countTimes}
          </AppText>
        </Surface>

        {keyword.q_ref_id && keyword.q_ref_id.length > 0 && (
          <Surface elevation={0} style={styles.refSection}>
            <AppText
              style={[
                styles.refLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {texts.keywordDetails.quistionCount}
            </AppText>
            <Surface elevation={0} style={styles.chipsContainer}>
              {keyword.q_ref_id.map((id, index) => (
                <ExamChip key={index} id={id} />
              ))}
            </Surface>
          </Surface>
        )}

        {keyword.ref_id && keyword.ref_id.length > 0 && (
          <Surface elevation={0} style={styles.refSection}>
            <AppText
              style={[
                styles.refLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {texts.keywordDetails.optionCount}
            </AppText>
            <Surface elevation={0} style={styles.chipsContainer}>
              {keyword.ref_id.map((id, index) => (
                <ExamChip key={index} id={id} />
              ))}
            </Surface>
          </Surface>
        )}
      </ScrollView>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: "bold",
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // marginBottom: spacing.md,
  },
  importanceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.md,
  },
  importanceText: {
    fontSize: typography.sizes.xs,
    fontWeight: "bold",
  },
  eraCard: {
    padding: spacing.md,
    borderRadius: spacing.sm,
    // marginBottom: spacing.md,
  },
  eraScriptTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "bold",
    marginBottom: spacing.md,
    // textAlign: "center",
  },
  eraInfoGrid: {
    gap: spacing.xs,
  },
  eraTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  eraValue: {
    fontSize: typography.sizes.xl,
    fontWeight: "bold",
  },
  eraYearValue: {
    fontSize: typography.sizes.xl,
    fontWeight: "300",
  },
  divider: {
    marginVertical: spacing.lg,
  },
  infoSection: {
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.sizes.lg,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "bold",
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.reg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    marginBottom: spacing.xs,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  noData: {
    fontSize: typography.sizes.md,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  refSection: {
    marginTop: spacing.md,
  },
  refLabel: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  refChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    // marginBottom: spacing.xs,
  },
  refChipText: {
    fontSize: typography.sizes.xs,
    // lineHeight: 16,
  },
});

export default KeywordDetailScreen;
