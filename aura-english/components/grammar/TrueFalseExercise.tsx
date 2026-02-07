/**
 * TrueFalseExercise – reusable component for true/false grammar exercises.
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

export const TrueFalseExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
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

  const getButtonStyle = (option: string) => {
    if (!submitted) {
      return option === selected ? styles.selectedButton : styles.defaultButton;
    }
    if (option === exercise.correctAnswer) return styles.correctButton;
    if (option === selected) return styles.incorrectButton;
    return styles.defaultButton;
  };

  const getButtonTextStyle = (option: string) => {
    if (!submitted) {
      return option === selected ? styles.selectedButtonText : styles.defaultButtonText;
    }
    if (option === exercise.correctAnswer) return styles.correctButtonText;
    if (option === selected) return styles.incorrectButtonText;
    return styles.defaultButtonText;
  };

  const options = exercise.options ?? ['True', 'False'];

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{exercise.question}</Text>

      <View style={styles.row}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.button, getButtonStyle(option)]}
            onPress={() => handleSelect(option)}
            disabled={submitted}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, getButtonTextStyle(option)]}>{option}</Text>
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
  row: { flexDirection: 'row', gap: sizes.spacing.sm },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: sizes.radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  defaultButton: { borderColor: colors.border, backgroundColor: colors.surface },
  selectedButton: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  correctButton: { borderColor: colors.success, backgroundColor: colors.success + '10' },
  incorrectButton: { borderColor: colors.error, backgroundColor: colors.error + '10' },
  buttonText: { fontSize: sizes.fontSize.md, fontWeight: '600' },
  defaultButtonText: { color: colors.text.primary },
  selectedButtonText: { color: colors.primary },
  correctButtonText: { color: colors.success },
  incorrectButtonText: { color: colors.error },
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
