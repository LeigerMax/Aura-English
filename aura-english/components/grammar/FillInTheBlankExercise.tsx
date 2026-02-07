/**
 * FillInTheBlankExercise – reusable component for fill-in-the-blank grammar exercises.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import { sizes } from '@/constants';
import { checkAnswer } from '@/data/grammar';
import type { GrammarExercise } from '@/types/grammar';

interface Props {
  exercise: GrammarExercise;
  onAnswer: (userAnswer: string, isCorrect: boolean) => void;
}

export const FillInTheBlankExercise: React.FC<Props> = ({ exercise, onAnswer }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!input.trim() || submitted) return;
    const correct = checkAnswer(input, exercise.correctAnswer);
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(input.trim(), correct);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{exercise.question}</Text>

      <TextInput
        style={[
          styles.input,
          submitted && (isCorrect ? styles.inputCorrect : styles.inputIncorrect),
        ]}
        value={input}
        onChangeText={setInput}
        placeholder="Type your answer…"
        placeholderTextColor={colors.text.tertiary}
        editable={!submitted}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      {!submitted && (
        <TouchableOpacity
          style={[styles.submitButton, !input.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!input.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>Check Answer</Text>
        </TouchableOpacity>
      )}

      {submitted && (
        <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <View style={styles.feedbackHeader}>
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={isCorrect ? colors.success : colors.error}
            />
            <Text style={[styles.feedbackTitle, isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleIncorrect]}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
          </View>
          {!isCorrect && (
            <Text style={styles.correctAnswerText}>
              Correct answer: <Text style={styles.correctAnswerHighlight}>{exercise.correctAnswer}</Text>
            </Text>
          )}
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
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: sizes.radius.lg,
    padding: sizes.spacing.md,
    fontSize: sizes.fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  inputCorrect: { borderColor: colors.success, backgroundColor: colors.success + '08' },
  inputIncorrect: { borderColor: colors.error, backgroundColor: colors.error + '08' },
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
  correctAnswerText: { fontSize: sizes.fontSize.sm, color: colors.text.secondary, marginBottom: 4 },
  correctAnswerHighlight: { fontWeight: '700', color: colors.text.primary },
  feedbackText: { fontSize: sizes.fontSize.sm, color: colors.text.secondary, lineHeight: 20 },
});
