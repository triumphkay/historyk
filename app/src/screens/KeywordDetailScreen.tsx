import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text, Divider, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { getScoreFrequencyLabel } from '../utils/score';
import { formatReferenceId } from '../utils/referenceFormatter';

type Props = NativeStackScreenProps<RootStackParamList, 'KeywordDetail'>;

const KeywordDetailScreen: React.FC<Props> = ({ route }) => {
  const theme = useTheme();
  const { keyword } = route.params;

  const importanceLabel = getScoreFrequencyLabel(keyword.score);
  const occurrenceCount = keyword.ref_id.length + keyword.q_ref_id.length;

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>{keyword.keyword}</Text>
          <Surface elevation={0} style={[styles.importanceBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text style={[styles.importanceText, { color: theme.colors.onSecondaryContainer }]}>
              {importanceLabel || '중요도 없음'}
            </Text>
          </Surface>
        </View>

        <Divider style={styles.divider} />

        {/* Era Information Block */}
        {(keyword.era && keyword.era.length > 0) || keyword.years ? (
          <>
            <Surface elevation={1} style={[styles.eraCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              {/* Era Script Header */}
              {keyword.era_script && keyword.era_script.length > 0 && keyword.era_script[0] ? (
                <Text style={[styles.eraScriptTitle, { color: theme.colors.onSurface }]}>
                  {keyword.keyword} {keyword.era_script[0]}
                </Text>
              ) : null}

              <View style={styles.eraInfoGrid}>
                <View style={styles.eraTextContainer}>
                  {[
                    ...(keyword.era || []),
                    ...(keyword.sub_era || []),
                    ...(keyword.det_era || [])
                  ].filter(Boolean).map((text, i) => (
                    <Text key={`era-text-${i}`} style={[styles.eraValue, { color: theme.colors.onSurface, marginRight: spacing.sm }]}>
                      {text}
                    </Text>
                  ))}
                </View>

                {keyword.years ? (
                  <Text style={[styles.eraValue, { color: theme.colors.onSurfaceVariant, marginTop: spacing.xs }]}>
                    {keyword.years}
                  </Text>
                ) : null}
              </View>
            </Surface>
            <Divider style={styles.divider} />
          </>
        ) : null}

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>설명</Text>
        {keyword.descriptions && keyword.descriptions.length > 0 ? (
          <Surface elevation={0} style={styles.chipsContainer}>
            {keyword.descriptions.map((desc, index) => (
              <Surface
                key={index}
                elevation={1}
                style={[styles.chip, { backgroundColor: theme.colors.secondaryContainer }]}
              >
                <Text style={[styles.chipText, { color: theme.colors.onSecondaryContainer }]}>
                  {desc}
                </Text>
              </Surface>
            ))}
          </Surface>
        ) : (
          <Text style={[styles.noData, { color: theme.colors.onSurfaceVariant }]}>설명이 없습니다.</Text>
        )}

        <Divider style={styles.divider} />

        <Surface elevation={0} style={styles.infoSection}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>출제 횟수</Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>
            {occurrenceCount}회
          </Text>
        </Surface>

        {keyword.q_ref_id && keyword.q_ref_id.length > 0 && (
          <Surface elevation={0} style={styles.refSection}>
            <Text style={[styles.refLabel, { color: theme.colors.onSurfaceVariant }]}>지문 출제</Text>
            <Surface elevation={0} style={styles.chipsContainer}>
              {keyword.q_ref_id.map((id, index) => (
                <Surface
                  key={index}
                  elevation={1}
                  style={[styles.refChip, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <Text style={[styles.refChipText, { color: theme.colors.onSurfaceVariant }]}>
                    {formatReferenceId(id)}
                  </Text>
                </Surface>
              ))}
            </Surface>
          </Surface>
        )}

        {keyword.ref_id && keyword.ref_id.length > 0 && (
          <Surface elevation={0} style={styles.refSection}>
            <Text style={[styles.refLabel, { color: theme.colors.onSurfaceVariant }]}>보기 출제</Text>
            <Surface elevation={0} style={styles.chipsContainer}>
              {keyword.ref_id.map((id, index) => (
                <Surface
                  key={index}
                  elevation={1}
                  style={[styles.refChip, { backgroundColor: theme.colors.surfaceVariant }]}
                >
                  <Text style={[styles.refChipText, { color: theme.colors.onSurfaceVariant }]}>
                    {formatReferenceId(id)}
                  </Text>
                </Surface>
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
    flex: 1
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    flex: 1
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  importanceBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.md
  },
  importanceText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold
  },
  eraCard: {
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md
  },
  eraScriptTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  eraInfoGrid: {
    gap: spacing.sm
  },
  eraTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  eraValue: {
    fontSize: typography.sizes.md
  },
  divider: {
    marginVertical: spacing.md
  },
  infoSection: {
    marginBottom: spacing.sm
  },
  label: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs
  },
  value: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    marginBottom: spacing.xs
  },
  chipText: {
    fontSize: typography.sizes.sm,
    lineHeight: 18
  },
  noData: {
    fontSize: typography.sizes.md,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: spacing.lg
  },
  refSection: {
    marginTop: spacing.md
  },
  refLabel: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
    fontWeight: typography.weights.medium
  },
  refChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.xs
  },
  refChipText: {
    fontSize: typography.sizes.xs,
    lineHeight: 16
  }
});

export default KeywordDetailScreen;
