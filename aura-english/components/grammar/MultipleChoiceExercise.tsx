/**
 * MultipleChoiceExercise – reusable component for multiple-choice grammar exercises.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import { sizes } from '@/constants';
import type { GrammarExercise } from '@/types/grammar';

interface Props {
  exercise: GrammarExercise;
  onAnswer: (userAnswer: string, isCorrect: boolean) => void;
}

export const MultipleChoiceExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (!selected || submitted) return;
    setSubmitted(true);
    const isCorrect = selected === exercise.correctAnswer;
    onAnswer(selected, isCorrect);
  };

  const getOptionStyle = (option: string) => {
    if (!submitted) {
      return option === selected ? styles.optionSelected : styles.optionDefault;
    }
    if (option === exercise.correctAnswer) return styles.optionCorrect;
    if (option === selected) return styles.optionIncorrect;
    return styles.optionDefault;
  };

  const getOptionTextStyle = (option: string) => {
    if (!submitted) {
      return option === selected ? styles.optionTextSelected : styles.optionTextDefault;
    }
    if (option === exercise.correctAnswer) return styles.optionTextCorrect;
    if (option === selected) return styles.optionTextIncorrect;
    return styles.optionTextDefault;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{exercise.question}</Text>

      <View style={styles.options}>
        {exercise.options?.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, getOptionStyle(option)]}
            onPress={() => handleSelect(option)}
            activeOpacity={0.7}
            disabled={submitted}
          >
            <Text style={[styles.optionText, getOptionTextStyle(option)]}>{option}</Text>
            {submitted && option === exercise.correctAnswer && (
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            )}
            {submitted && option === selected && option !== exercise.correctAnswer && (
              <Ionicons name="close-circle" size={20} color={colors.error} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {!submitted && (
        <TouchableOpacity
          style={[styles.submitButton, !selected && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selected}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Check Answer</Text>
        </TouchableOpacity>
      )}

      {submitted && (
        <View style={[styles.feedback, selected === exercise.correctAnswer ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <View style={styles.feedbackHeader}>
            <Ionicons
              name={selected === exercise.correctAnswer ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={selected === exercise.correctAnswer ? colors.success : colors.error}
            />
            <Text style={[styles.feedbackTitle, selected === exercise.correctAnswer ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect]}>
              {selected === exercise.correctAnswer ? 'Correct!' : 'Incorrect'}
            </Text>
          </View>
          <Text style={styles.feedbackText}>{exercise.explanation}</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { marginBottom: sizes.spacing.lg },
  question: {
    fontSize: sizes.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: sizes.spacing.md,
    lineHeight: 26,
  },
  options: { gap: sizes.spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: sizes.spacing.md,
    borderRadius: sizes.radius.lg,
    borderWidth: 1.5,
  },
  optionDefault: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionCorrect: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  optionIncorrect: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  optionText: { fontSize: sizes.fontSize.md, flex: 1 },
  optionTextDefault: { color: colors.text.primary },
  optionTextSelected: { color: colors.primary, fontWeight: '600' },
  optionTextCorrect: { color: colors.success, fontWeight: '600' },
  optionTextIncorrect: { color: colors.error, fontWeight: '600' },
  submitButton: {
    marginTop: sizes.spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: sizes.radius.lg,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: { color: colors.text.inverse, fontSize: sizes.fontSize.md, fontWeight: '700' },
  feedback: {
    marginTop: sizes.spacing.md,
    padding: sizes.spacing.md,
    borderRadius: sizes.radius.lg,
    borderWidth: 1,
  },
  feedbackCorrect: { borderColor: colors.success, backgroundColor: colors.success + '08' },
  feedbackIncorrect: { borderColor: colors.error, backgroundColor: colors.error + '08' },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  feedbackTitle: { fontSize: sizes.fontSize.md, fontWeight: '700', marginLeft: 6 },
  feedbackTitleCorrect: { color: colors.success },
  feedbackTitleIncorrect: { color: colors.error },
  feedbackText: { fontSize: sizes.fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
});
