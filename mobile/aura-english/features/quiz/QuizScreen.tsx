import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/features/home/HomeScreen';
import {
  getQuizFlashcards,
  generateQuizQuestions,
  evaluateAnswer,
  applyReview,
} from '@/core/engine';
import { deckRepository } from '@/data/repositories';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import { playSound } from '@/core/services/soundService';
import { getNextHint, applyHintPenalty, MAX_HINTS } from '@/core/services/hintService';
import type { Deck, QuizQuestion, QuizAnswerResult, QualityScore, Hint, HintType } from '@/types/models';

type QuizScreenProps = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

type QuizPhase = 'deck_selection' | 'in_progress' | 'results';

const QUIZ_SIZE = 10;

function getResultMessage(percentage: number): string {
  if (percentage >= 50) return 'Good job!';
  return 'Keep practicing!';
}

function getOptionStyle(
  option: string,
  selectedAnswer: string | null,
  correctAnswer: string,
  submitted: boolean,
  styles: ReturnType<typeof createStyles>,
) {
  if (submitted) {
    if (option === correctAnswer) return styles.optionCorrect;
    if (option === selectedAnswer) return styles.optionIncorrect;
    return styles.optionDefault;
  }
  if (option === selectedAnswer) return styles.optionSelected;
  return styles.optionDefault;
}

function getFillInputStyle(
  submitted: boolean,
  userAnswer: string,
  correctAnswer: string,
  styles: ReturnType<typeof createStyles>,
) {
  if (!submitted) return null;
  const isCorrect = evaluateAnswer(userAnswer, correctAnswer);
  return isCorrect ? styles.fillInputCorrect : styles.fillInputIncorrect;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ navigation }) => {
  const [phase, setPhase] = useState<QuizPhase>('deck_selection');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<QuizAnswerResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState(0);

  // Hint state (only for fill-in-the-blank)
  const [revealedHints, setRevealedHints] = useState<Hint[]>([]);
  const [usedHintTypes, setUsedHintTypes] = useState<HintType[]>([]);

  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setLoading(true);
    const allDecks = await deckRepository.getAllDecks();
    const globalDeck = await deckRepository.getGlobalDeck();
    setDecks([globalDeck, ...allDecks]);
    setLoading(false);
  };

  const startQuiz = async (deckId: string) => {
    setLoading(true);
    const flashcards = await getQuizFlashcards(deckId, QUIZ_SIZE);

    if (flashcards.length < 2) {
      setLoading(false);
      return;
    }

    initQuizSession(flashcards);
    setLoading(false);
  };

  const initQuizSession = (flashcards: import('@/types/models').Flashcard[]) => {
    const quizQuestions = generateQuizQuestions(flashcards, QUIZ_SIZE);
    setQuestions(quizQuestions);
    resetQuizState();
    setPhase('in_progress');
  };

  const resetQuizState = () => {
    setCurrentIndex(0);
    setResults([]);
    setSelectedAnswer(null);
    setFillAnswer('');
    setAnswerSubmitted(false);
    setAnswerStartTime(Date.now());
    setRevealedHints([]);
    setUsedHintTypes([]);
  };

  const handleMCQSelect = (answer: string) => {
    if (answerSubmitted) return;
    setSelectedAnswer(answer);
  };

  const submitAnswer = async () => {
    if (!currentQuestion) return;

    const { userAnswer, isCorrect } = evaluateCurrentAnswer();
    if (userAnswer === null) return;

    const elapsed = Date.now() - answerStartTime;
    let quality: QualityScore;
    if (!isCorrect) {
      quality = 1;
    } else if (elapsed > 10000) {
      quality = 3;
    } else {
      quality = 5;
    }

    // Penalize quality if hints were used
    quality = applyHintPenalty(quality, revealedHints.length);

    // Sound feedback on correct answer
    if (isCorrect) {
      playSound('correct');
    }

    const result: QuizAnswerResult = {
      questionId: currentQuestion.id,
      flashcardId: currentQuestion.flashcard.id,
      isCorrect,
      quality,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer,
    };

    setResults((prev) => [...prev, result]);
    setAnswerSubmitted(true);

    await applyReview({
      flashcardId: currentQuestion.flashcard.id,
      quality,
      source: 'quiz',
    });
  };

  const evaluateCurrentAnswer = (): { userAnswer: string | null; isCorrect: boolean } => {
    if (!currentQuestion) return { userAnswer: null, isCorrect: false };

    if (currentQuestion.type === 'multiple_choice') {
      if (!selectedAnswer) return { userAnswer: null, isCorrect: false };
      return {
        userAnswer: selectedAnswer,
        isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      };
    }

    const trimmed = fillAnswer.trim();
    if (!trimmed) return { userAnswer: null, isCorrect: false };
    return {
      userAnswer: trimmed,
      isCorrect: evaluateAnswer(trimmed, currentQuestion.correctAnswer),
    };
  };

  const handleRevealHint = () => {
    if (!currentQuestion) return;
    const hint = getNextHint(currentQuestion.flashcard, usedHintTypes);
    if (!hint) return;
    setRevealedHints((prev) => [...prev, hint]);
    setUsedHintTypes((prev) => [...prev, hint.type]);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setPhase('results');
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setFillAnswer('');
      setAnswerSubmitted(false);
      setAnswerStartTime(Date.now());
      setRevealedHints([]);
      setUsedHintTypes([]);
    }
  };

  // === RENDER PHASES ===

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // --- Deck Selection ---
  if (phase === 'deck_selection') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.deckList}>
          <Text style={styles.sectionTitle}>Choose a deck for the quiz</Text>
          {decks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={styles.deckItem}
              onPress={() => startQuiz(deck.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.deckColorDot, { backgroundColor: deck.color }]} />
              <View style={styles.deckInfo}>
                <Text style={styles.deckName}>{deck.name}</Text>
                <Text style={styles.deckCount}>
                  {deck.cardCount ?? 0} card{(deck.cardCount ?? 0) === 1 ? '' : 's'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Results ---
  if (phase === 'results') {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const total = results.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scorePercentage}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>
              {correctCount}/{total} correct
            </Text>
          </View>

          <Text style={styles.resultsTitle}>
            {percentage >= 80
              ? 'Excellent!'
              : getResultMessage(percentage)}
          </Text>

          <View style={styles.resultsBreakdown}>
            {results.map((r, i) => (
              <View key={r.questionId} style={styles.resultRow}>
                <Ionicons
                  name={r.isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={r.isCorrect ? colors.success : colors.error}
                />
                <Text style={styles.resultWord} numberOfLines={1}>
                  {questions[i]?.flashcard.word}
                </Text>
                {!r.isCorrect && (
                  <Text style={styles.resultCorrectAnswer} numberOfLines={1}>
                    {r.correctAnswer}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.resultsButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setPhase('deck_selection');
                loadDecks();
              }}
            >
              <Text style={styles.secondaryButtonText}>New Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { flex: 1 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- In Progress ---
  if (!currentQuestion) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.questionContainer}>
          {/* Question type badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {currentQuestion.type === 'multiple_choice'
                ? 'Multiple Choice'
                : 'Fill in the Blank'}
            </Text>
          </View>

          {/* Question */}
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {/* Fill-in-the-blank sentence */}
          {currentQuestion.type === 'fill_in_the_blank' &&
            currentQuestion.sentenceWithBlank && (
              <Text style={styles.blankSentence}>
                {currentQuestion.sentenceWithBlank}
              </Text>
            )}

          {/* MCQ Options */}
          {currentQuestion.type === 'multiple_choice' &&
            currentQuestion.options?.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              const optionStyle = getOptionStyle(option, selectedAnswer, currentQuestion.correctAnswer, answerSubmitted, styles);

              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionButton, optionStyle]}
                  onPress={() => handleMCQSelect(option)}
                  disabled={answerSubmitted}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      answerSubmitted && isCorrectOption && styles.optionTextCorrect,
                      answerSubmitted && isSelected && !isCorrectOption && styles.optionTextIncorrect,
                    ]}
                    numberOfLines={3}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}

          {/* Fill-in-the-blank input */}
          {currentQuestion.type === 'fill_in_the_blank' && (
            <View>
              <TextInput
                style={[
                  styles.fillInput,
                  getFillInputStyle(answerSubmitted, fillAnswer, currentQuestion.correctAnswer, styles),
                ]}
                placeholder="Type your answer..."
                placeholderTextColor={colors.text.tertiary}
                value={fillAnswer}
                onChangeText={setFillAnswer}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!answerSubmitted}
              />

              {/* Hint button — only before submission */}
              {!answerSubmitted && usedHintTypes.length < MAX_HINTS && (
                <TouchableOpacity
                  style={styles.hintButton}
                  onPress={handleRevealHint}
                  activeOpacity={0.7}
                >
                  <Ionicons name="bulb-outline" size={18} color={colors.warning} />
                  <Text style={styles.hintButtonText}>
                    Hint ({usedHintTypes.length}/{MAX_HINTS})
                  </Text>
                </TouchableOpacity>
              )}

              {/* Revealed hints */}
              {revealedHints.length > 0 && (
                <View style={styles.hintsContainer}>
                  {revealedHints.map((hint, i) => (
                    <View key={hint.type} style={styles.hintRow}>
                      <Ionicons name="bulb" size={14} color={colors.warning} />
                      <Text style={styles.hintText}>{hint.content}</Text>
                    </View>
                  ))}
                </View>
              )}

              {answerSubmitted &&
                !evaluateAnswer(fillAnswer, currentQuestion.correctAnswer) && (
                  <Text style={styles.correctAnswerHint}>
                    Correct answer: {currentQuestion.correctAnswer}
                  </Text>
                )}
            </View>
          )}
        </ScrollView>

        {/* Action button */}
        <View style={styles.actionContainer}>
          {answerSubmitted ? (
            <TouchableOpacity style={styles.primaryButton} onPress={nextQuestion}>
              <Text style={styles.primaryButtonText}>
                {currentIndex + 1 >= questions.length ? 'See Results' : 'Next'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                !(selectedAnswer || fillAnswer.trim()) && styles.buttonDisabled,
              ]}
              onPress={submitAnswer}
              disabled={!(selectedAnswer || fillAnswer.trim())}
            >
              <Text style={styles.primaryButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text.secondary,
    fontSize: 16,
  },
  deckList: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  deckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  deckColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 14,
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deckCount: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    marginTop: 8,
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  questionContainer: {
    padding: 24,
    flexGrow: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  typeBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 28,
    marginBottom: 24,
  },
  blankSentence: {
    fontSize: 18,
    color: colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 28,
    marginBottom: 24,
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 2,
  },
  optionDefault: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  optionCorrect: {
    backgroundColor: '#10B98115',
    borderColor: '#10B981',
  },
  optionIncorrect: {
    backgroundColor: '#EF444415',
    borderColor: '#EF4444',
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  optionTextCorrect: {
    color: '#10B981',
    fontWeight: '600',
  },
  optionTextIncorrect: {
    color: '#EF4444',
    fontWeight: '600',
  },
  fillInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  fillInputCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  fillInputIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444410',
  },
  correctAnswerHint: {
    marginTop: 12,
    fontSize: 15,
    color: colors.success,
    fontWeight: '600',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.warning + '15',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  hintButtonText: {
    color: colors.warning,
    fontSize: 14,
    fontWeight: '600',
  },
  hintsContainer: {
    marginTop: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  resultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  scorePercentage: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
  },
  resultsBreakdown: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  resultWord: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginLeft: 10,
  },
  resultCorrectAnswer: {
    fontSize: 13,
    color: colors.text.secondary,
    maxWidth: '40%',
  },
  resultsButtons: {
    flexDirection: 'row',
    width: '100%',
  },
});
