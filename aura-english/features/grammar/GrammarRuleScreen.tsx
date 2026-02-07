/**
 * GrammarRuleScreen – displays the full explanation of a grammar rule
 * followed by its predefined exercises.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import { sizes } from '@/constants';
import { getRuleById, getExercisesForRule } from '@/data/grammar';
import { ExerciseRenderer } from '@/components/grammar';
import type { RootStackParamList } from '@/features/home/HomeScreen';
import type { ExerciseAnswerResult, ExerciseSessionSummary } from '@/types/grammar';

type Props = NativeStackScreenProps<RootStackParamList, 'GrammarRule'>;

export const GrammarRuleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const { ruleId } = route.params;
  const rule = getRuleById(ruleId);
  const exercises = getExercisesForRule(ruleId);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [results, setResults] = useState<ExerciseAnswerResult[]>([]);
  const [showExercises, setShowExercises] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const handleAnswer = useCallback(
    (userAnswer: string, isCorrect: boolean) => {
      const exercise = exercises[currentExerciseIndex];
      setResults((prev) => [
        ...prev,
        {
          exerciseId: exercise.id,
          grammarRuleId: exercise.grammarRuleId,
          isCorrect,
          userAnswer,
          correctAnswer: exercise.correctAnswer,
        },
      ]);
    },
    [currentExerciseIndex, exercises],
  );

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex((i) => i + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentExerciseIndex(0);
    setResults([]);
    setSessionComplete(false);
  };

  if (!rule) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.muted}>Rule not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const summary: ExerciseSessionSummary | null = sessionComplete
    ? {
        grammarRuleId: ruleId,
        totalQuestions: exercises.length,
        correctAnswers: results.filter((r) => r.isCorrect).length,
        results,
      }
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Theory Section ────────────────────── */}
        <Text style={styles.title}>{rule.title}</Text>
        <Text style={styles.shortDesc}>{rule.shortDescription}</Text>

        {/* Usage explanation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📘 Explanation</Text>
          <Text style={styles.body}>{rule.usageExplanation}</Text>
        </View>

        {/* Structure */}
        <View style={styles.structureBox}>
          <Text style={styles.structureLabel}>Structure</Text>
          <Text style={styles.structureText}>{rule.structure}</Text>
        </View>

        {/* Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Examples</Text>
          {rule.examples.map((ex, i) => (
            <View key={i} style={styles.exampleRow}>
              <Text style={styles.exampleBullet}>•</Text>
              <View style={styles.exampleContent}>
                <Text style={styles.exampleSentence}>
                  {ex.sentence}
                </Text>
                {ex.highlight && (
                  <Text style={styles.exampleHighlight}>Key: {ex.highlight}</Text>
                )}
                {ex.translation && (
                  <Text style={styles.exampleTranslation}>{ex.translation}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Common Mistakes */}
        {rule.commonMistakes && rule.commonMistakes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Common Mistakes</Text>
            {rule.commonMistakes.map((m, i) => (
              <View key={i} style={styles.mistakeCard}>
                <View style={styles.mistakeRow}>
                  <Ionicons name="close-circle" size={16} color={colors.error} />
                  <Text style={styles.mistakeIncorrect}>{m.incorrect}</Text>
                </View>
                <View style={styles.mistakeRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.mistakeCorrect}>{m.correct}</Text>
                </View>
                <Text style={styles.mistakeExpl}>{m.explanation}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Exercise Section ──────────────────── */}
        {exercises.length > 0 && !showExercises && !sessionComplete && (
          <TouchableOpacity style={styles.practiseButton} onPress={() => setShowExercises(true)} activeOpacity={0.7}>
            <Ionicons name="fitness-outline" size={20} color={colors.text.inverse} />
            <Text style={styles.practiseButtonText}>
              Practise ({exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'})
            </Text>
          </TouchableOpacity>
        )}

        {showExercises && !sessionComplete && (
          <View style={styles.exerciseSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                Exercise {currentExerciseIndex + 1} / {exercises.length}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` },
                  ]}
                />
              </View>
            </View>

            <ExerciseRenderer
              key={exercises[currentExerciseIndex].id}
              exercise={exercises[currentExerciseIndex]}
              onAnswer={handleAnswer}
            />

            {/* Show "Next" only after the current question has been answered */}
            {results.length > currentExerciseIndex && (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.7}>
                <Text style={styles.nextButtonText}>
                  {currentExerciseIndex < exercises.length - 1 ? 'Next' : 'See Results'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={colors.text.inverse} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Results ───────────────────────────── */}
        {sessionComplete && summary && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>🎯 Practice Complete</Text>
            <Text style={styles.resultsScore}>
              {summary.correctAnswers} / {summary.totalQuestions} correct
            </Text>

            <View style={styles.resultsBar}>
              <View
                style={[
                  styles.resultsFill,
                  {
                    width: `${(summary.correctAnswers / summary.totalQuestions) * 100}%`,
                    backgroundColor:
                      summary.correctAnswers / summary.totalQuestions >= 0.7
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              />
            </View>

            <Text style={styles.resultsMessage}>
              {summary.correctAnswers === summary.totalQuestions
                ? 'Perfect score! 🎉'
                : summary.correctAnswers / summary.totalQuestions >= 0.7
                  ? 'Great job! Keep it up! 💪'
                  : 'Keep practising — you\'ll get there! 📚'}
            </Text>

            <View style={styles.resultsActions}>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.7}>
                <Ionicons name="refresh" size={18} color={colors.primary} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: sizes.spacing.lg, paddingBottom: sizes.spacing.xxxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { fontSize: sizes.fontSize.md, color: colors.text.secondary },

  // Theory
  title: { fontSize: sizes.fontSize.xxl, fontWeight: '800', color: colors.text.primary },
  shortDesc: { fontSize: sizes.fontSize.md, color: colors.text.secondary, marginTop: 4, marginBottom: sizes.spacing.lg },
  section: { marginBottom: sizes.spacing.lg },
  sectionTitle: { fontSize: sizes.fontSize.lg, fontWeight: '700', color: colors.text.primary, marginBottom: sizes.spacing.sm },
  body: { fontSize: sizes.fontSize.md, color: colors.text.primary, lineHeight: 24 },
  structureBox: {
    backgroundColor: colors.primary + '0A',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: sizes.radius.md,
    padding: sizes.spacing.md,
    marginBottom: sizes.spacing.lg,
  },
  structureLabel: { fontSize: sizes.fontSize.xs, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  structureText: { fontSize: sizes.fontSize.md, color: colors.text.primary, fontFamily: 'monospace' },

  // Examples
  exampleRow: { flexDirection: 'row', marginBottom: sizes.spacing.sm },
  exampleBullet: { fontSize: sizes.fontSize.md, color: colors.text.tertiary, marginRight: 8, marginTop: 1 },
  exampleContent: { flex: 1 },
  exampleSentence: { fontSize: sizes.fontSize.md, color: colors.text.primary, lineHeight: 22 },
  exampleHighlight: { fontSize: sizes.fontSize.sm, color: colors.primary, fontWeight: '600', marginTop: 2 },
  exampleTranslation: { fontSize: sizes.fontSize.sm, color: colors.text.tertiary, fontStyle: 'italic', marginTop: 2 },

  // Mistakes
  mistakeCard: {
    backgroundColor: colors.surface,
    borderRadius: sizes.radius.lg,
    padding: sizes.spacing.md,
    marginBottom: sizes.spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  mistakeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  mistakeIncorrect: { fontSize: sizes.fontSize.sm, color: colors.error, textDecorationLine: 'line-through' },
  mistakeCorrect: { fontSize: sizes.fontSize.sm, color: colors.success, fontWeight: '600' },
  mistakeExpl: { fontSize: sizes.fontSize.sm, color: colors.text.secondary, marginTop: 4, lineHeight: 20 },

  // Practise CTA
  practiseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: sizes.radius.xl,
    marginTop: sizes.spacing.md,
  },
  practiseButtonText: { color: colors.text.inverse, fontSize: sizes.fontSize.md, fontWeight: '700' },

  // Exercise section
  exerciseSection: {
    marginTop: sizes.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: sizes.spacing.lg,
  },
  progressRow: { marginBottom: sizes.spacing.lg },
  progressText: { fontSize: sizes.fontSize.sm, fontWeight: '600', color: colors.text.secondary, marginBottom: 6 },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: colors.borderLight },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },

  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: sizes.radius.lg,
  },
  nextButtonText: { color: colors.text.inverse, fontSize: sizes.fontSize.md, fontWeight: '700' },

  // Results
  resultsCard: {
    marginTop: sizes.spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: sizes.radius.xl,
    padding: sizes.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  resultsTitle: { fontSize: sizes.fontSize.xl, fontWeight: '800', color: colors.text.primary },
  resultsScore: { fontSize: sizes.fontSize.xxxl, fontWeight: '800', color: colors.primary, marginTop: sizes.spacing.sm },
  resultsBar: { width: '100%', height: 8, borderRadius: 4, backgroundColor: colors.borderLight, marginTop: sizes.spacing.md },
  resultsFill: { height: 8, borderRadius: 4 },
  resultsMessage: { fontSize: sizes.fontSize.md, color: colors.text.secondary, marginTop: sizes.spacing.md, textAlign: 'center' },
  resultsActions: { flexDirection: 'row', gap: sizes.spacing.sm, marginTop: sizes.spacing.lg, width: '100%' },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: sizes.radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  retryButtonText: { color: colors.primary, fontSize: sizes.fontSize.md, fontWeight: '700' },
  doneButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: sizes.radius.lg,
    backgroundColor: colors.primary,
  },
  doneButtonText: { color: colors.text.inverse, fontSize: sizes.fontSize.md, fontWeight: '700' },
});
