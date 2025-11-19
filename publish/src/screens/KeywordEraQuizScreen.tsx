import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Menu, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EraAnswerModal from '../components/EraAnswerModal';
import ReferenceModal from '../components/ReferenceModal';
import { useEraQuiz } from '../context/EraQuizContext';
import { RootStackParamList } from '../types/navigation';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { mergeReferenceIds } from '../utils/references';
import { getFrequencyLabel, parseYearParts } from '../utils/eraQuiz';
import keywordTypes from '../keywordTypesSource';

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
  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Button mode="outlined" onPress={() => setVisible(true)} disabled={disabled} style={styles.dropdownButton}>
          {value || label}
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

type Props = NativeStackScreenProps<RootStackParamList, 'KeywordEraQuiz'>;

const KeywordEraQuizScreen: React.FC<Props> = () => {
  const theme = useTheme();
  const { problems, currentProblem, currentIndex, totalProblems, goToNext, goToPrevious, loading, resetKey } = useEraQuiz();
  const [country, setCountry] = useState('');
  const [leader, setLeader] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [referenceVisible, setReferenceVisible] = useState(false);

  const keyAgeData = (keywordTypes as { 'key-age': Array<{ nation: string; list: string[] }> })['key-age'] || [];
  const countryOptions = useMemo(() => keyAgeData.map((item) => item.nation), [keyAgeData]);
  const leaderOptions = useMemo(() => {
    const entry = keyAgeData.find((item) => item.nation === country);
    return entry ? entry.list : [];
  }, [country, keyAgeData]);

  useEffect(() => {
    setCountry('');
    setLeader('');
    setYear('');
    setMonth('');
    setDay('');
  }, [currentProblem, resetKey]);

  const yearParts = useMemo(() => parseYearParts(currentProblem?.years || ''), [currentProblem]);
  const referenceEntries = useMemo(() => mergeReferenceIds(currentProblem?.ref_id || [], currentProblem?.q_ref_id || []), [currentProblem]);
  const frequencyLabel = useMemo(() => getFrequencyLabel(currentProblem?.score || []), [currentProblem]);

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < totalProblems - 1;
  const totalProblemCount = totalProblems;
  const currentProblemIndex =
    totalProblemCount > 0 ? Math.min(Math.max(currentIndex + 1, 1), totalProblemCount) : 0;

  if (loading) {
    return (
      <Surface style={styles.center}>
        <ActivityIndicator animating />
      </Surface>
    );
  }

  if (!currentProblem) {
    return (
      <Surface style={styles.center}>
        <Text>출제 가능한 문제가 없습니다.</Text>
      </Surface>
    );
  }

  const handleNumericChange = (value: string, length: number) => value.replace(/[^0-9]/g, '').slice(0, length);
  const showYearInputs = Boolean(yearParts.year);

  return (
    <Surface style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.card} elevation={1}>
          <Text style={[styles.hintLabel, { color: theme.colors.onSurfaceVariant }]}>키워드</Text>
          <Text style={[styles.keyword, { color: theme.colors.onSurface }]}>{currentProblem.keyword}</Text>
        </Surface>

        <View style={styles.dropdownRow}>
          <DropdownSelect label="국가" value={country} options={countryOptions} onSelect={setCountry} />
          <DropdownSelect label="왕 / 정부" value={leader} options={leaderOptions} onSelect={setLeader} disabled={!country} />
        </View>

        {showYearInputs ? (
          <Surface elevation={0} style={styles.yearContainer}>
            <Text style={[styles.hintLabel, { color: theme.colors.onSurfaceVariant }]}>연도</Text>
            <View style={styles.yearRow}>
              <TextInput
                mode="outlined"
                label="YYYY"
                keyboardType="numeric"
                value={year}
                onChangeText={(text) => setYear(handleNumericChange(text, 4))}
                style={styles.yearInput}
                placeholder="0000"
              />
              <Text style={styles.yearSuffix}>년</Text>
              <TextInput
                mode="outlined"
                label="MM"
                keyboardType="numeric"
                value={month}
                onChangeText={(text) => setMonth(handleNumericChange(text, 2))}
                style={styles.yearInput}
                disabled={!yearParts.month}
                placeholder="00"
              />
              <Text style={styles.yearSuffix}>월</Text>
              <TextInput
                mode="outlined"
                label="DD"
                keyboardType="numeric"
                value={day}
                onChangeText={(text) => setDay(handleNumericChange(text, 2))}
                style={styles.yearInput}
                disabled={!yearParts.day}
                placeholder="00"
              />
              <Text style={styles.yearSuffix}>일</Text>
            </View>
          </Surface>
        ) : null}

        <Text style={[styles.frequency, { color: theme.colors.onSurfaceVariant }]}>{frequencyLabel}</Text>

        <Button mode="outlined" onPress={() => setReferenceVisible(true)} style={styles.referenceButton}>
          {`${referenceEntries.length}회 출제`}
        </Button>

        <Button mode="contained" onPress={() => setAnswerModalVisible(true)}>
          확인하기
        </Button>

        <View style={styles.navRow}>
          <Button mode="outlined" disabled={!canGoPrevious} onPress={goToPrevious} style={styles.navButton}>
            이전
          </Button>
          <View style={styles.navIndexWrapper}>
            <Text style={[styles.navIndexText, { color: theme.colors.onSurface }]}>
              {currentProblemIndex} / {totalProblemCount}
            </Text>
          </View>
          <Button mode="outlined" disabled={!canGoNext} onPress={goToNext} style={styles.navButton}>
            다음
          </Button>
        </View>
      </ScrollView>

      <EraAnswerModal
        visible={answerModalVisible}
        times={currentProblem.times}
        years={currentProblem.years}
        onClose={() => setAnswerModalVisible(false)}
        onNext={() => {
          setAnswerModalVisible(false);
          if (canGoNext) {
            goToNext();
          }
        }}
      />
      <ReferenceModal
        visible={referenceVisible}
        entries={referenceEntries}
        onClose={() => setReferenceVisible(false)}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md
  },
  card: {
    padding: spacing.md,
    borderRadius: spacing.md
  },
  hintLabel: {
    fontSize: typography.sizes.sm
  },
  keyword: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  dropdownButton: {
    flex: 1
  },
  yearContainer: {
    padding: spacing.md,
    borderRadius: spacing.md
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  yearInput: {
    width: 80
  },
  yearSuffix: {
    fontSize: typography.sizes.md
  },
  frequency: {
    fontSize: typography.sizes.md
  },
  referenceButton: {
    marginTop: spacing.sm
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md
  },
  navButton: {
    minWidth: 100
  },
  navIndexWrapper: {
    flex: 1,
    alignItems: 'center'
  },
  navIndexText: {
    fontSize: 18,
    fontWeight: typography.weights.bold
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default KeywordEraQuizScreen;
