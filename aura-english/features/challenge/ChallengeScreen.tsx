import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '@/features/home/HomeScreen';
import { applyReview } from '@/core/engine/reviewService';
import { generateQuizQuestions, evaluateAnswer } from '@/core/engine/quizEngine';
import { selectChallengeCards, DEFAULT_CHALLENGE_CARD_LIMIT } from '@/core/services/challengeService';
import { hasApiKey } from '@/core/services/apiKeyService';
import { generateFrenchSentence, correctTranslation } from '@/core/services/geminiService';
import { deckRepository } from '@/data/repositories';
import { colors } from '@/constants';
import type {
  Deck,
  Flashcard,
  ChallengePhase,
  ChallengeSessionResult,
  QuizQuestion,
  QuizAnswerResult,
  QualityScore,
  TranslationExercise,
  TranslationResult,
} from '@/types/models';

type ChallengeScreenProps = NativeStackScreenProps<RootStackParamList, 'Challenge'>;

const QUIZ_SIZE = 8;

/** Map quality score to stats key */
function qualityToKey(quality: QualityScore): 'difficult' | 'correct' | 'easy' {
  if (quality === 1) return 'difficult';
  if (quality === 3) return 'correct';
  return 'easy';
}

// ──────────────────────────────────────────────
// ChallengeScreen Component
// ──────────────────────────────────────────────

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ navigation }) => {
  // Phase management
  const [phase, setPhase] = useState<ChallengePhase>('deck_selection');
  const [loading, setLoading] = useState(false);

  // Deck selection
  const [decks, setDecks] = useState<Deck[]>([]);

  // Session data
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [selectedDeckName, setSelectedDeckName] = useState('');

  // Flashcard review state
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewStats, setReviewStats] = useState({ difficult: 0, correct: 0, easy: 0 });
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizResults, setQuizResults] = useState<QuizAnswerResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerStartTime, setAnswerStartTime] = useState(0);

  // Translation state
  const [translationExercise, setTranslationExercise] = useState<TranslationExercise | null>(null);
  const [translationInput, setTranslationInput] = useState('');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);

  // Final results
  const [sessionResult, setSessionResult] = useState<ChallengeSessionResult | null>(null);

  // ── Load decks on mount ──
  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    setLoading(true);
    const allDecks = await deckRepository.getAllDecks();
    const globalDeck = await deckRepository.getGlobalDeck();
    setDecks([globalDeck, ...allDecks]);
    const keyAvailable = await hasApiKey();
    setApiKeyAvailable(keyAvailable);
    setLoading(false);
  };

  // ── Start a Challenge session ──
  const startChallenge = async (deck: Deck) => {
    setLoading(true);
    const cards = await selectChallengeCards({
      deckId: deck.id,
      deckName: deck.name,
      cardLimit: DEFAULT_CHALLENGE_CARD_LIMIT,
    });

    if (cards.length < 2) {
      Alert.alert(
        'Not enough cards',
        'You need at least 2 flashcards in this deck to start a challenge. Add more cards first!',
      );
      setLoading(false);
      return;
    }

    setSessionCards(cards);
    setSelectedDeckName(deck.name);
    resetSession();
    setPhase('flashcard_review');
    setLoading(false);
  };

  const resetSession = () => {
    setReviewIndex(0);
    setIsFlipped(false);
    setReviewStats({ difficult: 0, correct: 0, easy: 0 });
    flipAnim.setValue(0);
    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizResults([]);
    setSelectedAnswer(null);
    setFillAnswer('');
    setAnswerSubmitted(false);
    setTranslationExercise(null);
    setTranslationInput('');
    setTranslationResult(null);
    setSessionResult(null);
  };

  // ══════════════════════════════════════════════
  // PHASE 1: Flashcard Review
  // ══════════════════════════════════════════════

  const currentReviewCard = sessionCards[reviewIndex];

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      useNativeDriver: true,
      speed: 12,
      bounciness: 6,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleRate = async (quality: QualityScore) => {
    if (!currentReviewCard) return;

    const key = qualityToKey(quality);
    setReviewStats((prev) => ({ ...prev, [key]: prev[key] + 1 }));

    await applyReview({
      flashcardId: currentReviewCard.id,
      quality,
      source: 'challenge',
    });

    if (reviewIndex + 1 >= sessionCards.length) {
      // Move to quiz phase
      const questions = generateQuizQuestions(sessionCards, QUIZ_SIZE);
      setQuizQuestions(questions);
      setQuizIndex(0);
      setQuizResults([]);
      setSelectedAnswer(null);
      setFillAnswer('');
      setAnswerSubmitted(false);
      setAnswerStartTime(Date.now());
      setPhase('quiz');
    } else {
      setReviewIndex((prev) => prev + 1);
      setIsFlipped(false);
      flipAnim.setValue(0);
    }
  };

  // ══════════════════════════════════════════════
  // PHASE 2: Quiz
  // ══════════════════════════════════════════════

  const currentQuizQuestion = quizQuestions[quizIndex];

  const handleMCQSelect = (answer: string) => {
    if (answerSubmitted) return;
    setSelectedAnswer(answer);
  };

  const submitQuizAnswer = async () => {
    if (!currentQuizQuestion) return;

    let userAnswer: string | null = null;
    let isCorrect = false;

    if (currentQuizQuestion.type === 'multiple_choice') {
      if (!selectedAnswer) return;
      userAnswer = selectedAnswer;
      isCorrect = selectedAnswer === currentQuizQuestion.correctAnswer;
    } else {
      const trimmed = fillAnswer.trim();
      if (!trimmed) return;
      userAnswer = trimmed;
      isCorrect = evaluateAnswer(trimmed, currentQuizQuestion.correctAnswer);
    }

    const elapsed = Date.now() - answerStartTime;
    let quality: QualityScore;
    if (!isCorrect) quality = 1;
    else if (elapsed > 10000) quality = 3;
    else quality = 5;

    const result: QuizAnswerResult = {
      questionId: currentQuizQuestion.id,
      flashcardId: currentQuizQuestion.flashcard.id,
      isCorrect,
      quality,
      userAnswer: userAnswer,
      correctAnswer: currentQuizQuestion.correctAnswer,
    };

    setQuizResults((prev) => [...prev, result]);
    setAnswerSubmitted(true);

    await applyReview({
      flashcardId: currentQuizQuestion.flashcard.id,
      quality,
      source: 'challenge',
    });
  };

  const nextQuizQuestion = async () => {
    if (quizIndex + 1 >= quizQuestions.length) {
      // Quiz complete → move to translation or results
      const keyAvailable = await hasApiKey();
      setApiKeyAvailable(keyAvailable);
      if (keyAvailable) {
        startTranslationPhase();
      } else {
        finishSession(null);
      }
    } else {
      setQuizIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setFillAnswer('');
      setAnswerSubmitted(false);
      setAnswerStartTime(Date.now());
    }
  };

  // ══════════════════════════════════════════════
  // PHASE 3: Translation
  // ══════════════════════════════════════════════

  const startTranslationPhase = async () => {
    setPhase('translation');
    setTranslationLoading(true);
    try {
      const response = await generateFrenchSentence(sessionCards);
      setTranslationExercise({
        frenchSentence: response.frenchSentence,
        relatedWords: response.relatedWords,
      });
    } catch (err: any) {
      Alert.alert('AI Error', err.message || 'Failed to generate sentence.');
      finishSession(null);
    } finally {
      setTranslationLoading(false);
    }
  };

  const submitTranslation = async () => {
    if (!translationExercise || !translationInput.trim()) return;

    setTranslationLoading(true);
    try {
      const correction = await correctTranslation(
        translationExercise.frenchSentence,
        translationInput.trim(),
        translationExercise.relatedWords,
      );

      const quality: QualityScore = correction.isCorrect ? 5 : 1;

      const result: TranslationResult = {
        frenchSentence: translationExercise.frenchSentence,
        userTranslation: translationInput.trim(),
        correctedTranslation: correction.correctedTranslation,
        isCorrect: correction.isCorrect,
        feedback: correction.feedback,
        quality,
      };

      setTranslationResult(result);

      // Apply review for each card involved
      for (const card of sessionCards) {
        await applyReview({
          flashcardId: card.id,
          quality,
          source: 'challenge',
        });
      }
    } catch (err: any) {
      Alert.alert('AI Error', err.message || 'Failed to correct translation.');
    } finally {
      setTranslationLoading(false);
    }
  };

  const finishTranslation = () => {
    finishSession(translationResult);
  };

  // ══════════════════════════════════════════════
  // Results
  // ══════════════════════════════════════════════

  const finishSession = (transResult: TranslationResult | null) => {
    setSessionResult({
      reviewStats,
      quizResults,
      translationResult: transResult,
      totalCards: sessionCards.length,
    });
    setPhase('results');
  };

  // ══════════════════════════════════════════════
  // RENDERS
  // ══════════════════════════════════════════════

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparing challenge...</Text>
      </SafeAreaView>
    );
  }

  // ── Deck Selection ──
  if (phase === 'deck_selection') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.deckList}>
          <View style={styles.headerBox}>
            <LinearGradient
              colors={['#F59E0B', '#EF4444']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <Ionicons name="trophy" size={32} color="#fff" />
              <Text style={styles.headerTitle}>Challenge Mode</Text>
              <Text style={styles.headerSubtitle}>
                Review flashcards → Take a quiz → Translate a sentence
              </Text>
            </LinearGradient>
          </View>

          <Text style={styles.sectionTitle}>Choose a deck</Text>

          {!apiKeyAvailable && (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={18} color={colors.warning} />
              <Text style={styles.warningText}>
                No Gemini API key found. Translation phase will be skipped.
                Add your key in Settings.
              </Text>
            </View>
          )}

          {decks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={styles.deckItem}
              onPress={() => startChallenge(deck)}
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

  // ── Flashcard Review Phase ──
  if (phase === 'flashcard_review') {
    if (!currentReviewCard) return null;

    const frontRotateY = flipAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    const backRotateY = flipAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });
    const frontOpacity = flipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0, 0],
    });
    const backOpacity = flipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    });

    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Phase indicator */}
        <View style={styles.phaseBar}>
          <View style={[styles.phaseDot, styles.phaseDotActive]} />
          <View style={styles.phaseLine} />
          <View style={styles.phaseDot} />
          <View style={styles.phaseLine} />
          <View style={styles.phaseDot} />
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((reviewIndex + 1) / sessionCards.length) * 100}%`, backgroundColor: '#F59E0B' },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Card {reviewIndex + 1} of {sessionCards.length} — Review
          </Text>
        </View>

        {/* Flashcard */}
        <View style={styles.cardContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleFlip}
            style={{ minHeight: 260 }}
          >
            {/* Front */}
            <Animated.View
              style={[
                styles.flashcardSide,
                {
                  transform: [{ rotateY: frontRotateY }],
                  opacity: frontOpacity,
                  backfaceVisibility: 'hidden',
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                },
              ]}
            >
              <View style={styles.flashcardInner}>
                <Text style={styles.flashcardLabel}>WORD</Text>
                <Text style={styles.flashcardWord}>{currentReviewCard.word}</Text>
                <View style={styles.flipHint}>
                  <Ionicons name="sync-outline" size={16} color={colors.text.tertiary} />
                  <Text style={styles.flipHintText}>Tap to flip</Text>
                </View>
              </View>
            </Animated.View>

            {/* Back */}
            <Animated.View
              style={[
                styles.flashcardSide,
                styles.flashcardBack,
                {
                  transform: [{ rotateY: backRotateY }],
                  opacity: backOpacity,
                  backfaceVisibility: 'hidden',
                },
              ]}
            >
              <LinearGradient
                colors={['#F59E0B', '#EF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.flashcardInner}
              >
                <Text style={[styles.flashcardLabel, { color: '#fff' }]}>DEFINITION</Text>
                <Text style={styles.flashcardDefinition}>{currentReviewCard.definition}</Text>
                {currentReviewCard.context && (
                  <View style={styles.contextBox}>
                    <Text style={styles.contextLabel}>EXAMPLE</Text>
                    <Text style={styles.contextText}>"{currentReviewCard.context}"</Text>
                  </View>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Rating buttons (visible after flip) */}
        {isFlipped && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingPrompt}>How well did you know this?</Text>
            <View style={styles.ratingButtons}>
              <TouchableOpacity
                style={[styles.rateButton, { backgroundColor: colors.error + '15' }]}
                onPress={() => handleRate(1)}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
                <Text style={[styles.rateButtonText, { color: colors.error }]}>Hard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rateButton, { backgroundColor: colors.warning + '15' }]}
                onPress={() => handleRate(3)}
              >
                <Ionicons name="help-circle" size={24} color={colors.warning} />
                <Text style={[styles.rateButtonText, { color: colors.warning }]}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rateButton, { backgroundColor: colors.success + '15' }]}
                onPress={() => handleRate(5)}
              >
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <Text style={[styles.rateButtonText, { color: colors.success }]}>Easy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ── Quiz Phase ──
  if (phase === 'quiz') {
    if (!currentQuizQuestion) return null;

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          {/* Phase indicator */}
          <View style={styles.phaseBar}>
            <View style={[styles.phaseDot, styles.phaseDotDone]} />
            <View style={[styles.phaseLine, styles.phaseLineDone]} />
            <View style={[styles.phaseDot, styles.phaseDotActive]} />
            <View style={styles.phaseLine} />
            <View style={styles.phaseDot} />
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Question {quizIndex + 1} of {quizQuestions.length} — Quiz
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.questionContainer}>
            {/* Question type badge */}
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {currentQuizQuestion.type === 'multiple_choice'
                  ? 'Multiple Choice'
                  : 'Fill in the Blank'}
              </Text>
            </View>

            <Text style={styles.questionText}>{currentQuizQuestion.question}</Text>

            {/* Fill-in-the-blank sentence */}
            {currentQuizQuestion.type === 'fill_in_the_blank' &&
              currentQuizQuestion.sentenceWithBlank && (
                <Text style={styles.blankSentence}>
                  {currentQuizQuestion.sentenceWithBlank}
                </Text>
              )}

            {/* MCQ Options */}
            {currentQuizQuestion.type === 'multiple_choice' &&
              currentQuizQuestion.options?.map((option) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOpt = option === currentQuizQuestion.correctAnswer;
                const optStyle = getOptionStyle(option, selectedAnswer, currentQuizQuestion.correctAnswer, answerSubmitted);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, optStyle]}
                    onPress={() => handleMCQSelect(option)}
                    disabled={answerSubmitted}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        answerSubmitted && isCorrectOpt && styles.optionTextCorrect,
                        answerSubmitted && isSelected && !isCorrectOpt && styles.optionTextIncorrect,
                      ]}
                      numberOfLines={3}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}

            {/* Fill-in-the-blank input */}
            {currentQuizQuestion.type === 'fill_in_the_blank' && (
              <View>
                <TextInput
                  style={[
                    styles.fillInput,
                    answerSubmitted && (
                      evaluateAnswer(fillAnswer, currentQuizQuestion.correctAnswer)
                        ? styles.fillInputCorrect
                        : styles.fillInputIncorrect
                    ),
                  ]}
                  placeholder="Type your answer..."
                  placeholderTextColor={colors.text.tertiary}
                  value={fillAnswer}
                  onChangeText={setFillAnswer}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!answerSubmitted}
                />
                {answerSubmitted &&
                  !evaluateAnswer(fillAnswer, currentQuizQuestion.correctAnswer) && (
                    <Text style={styles.correctAnswerHint}>
                      Correct: {currentQuizQuestion.correctAnswer}
                    </Text>
                  )}
              </View>
            )}
          </ScrollView>

          {/* Action button */}
          <View style={styles.actionContainer}>
            {answerSubmitted ? (
              <TouchableOpacity style={styles.primaryButton} onPress={nextQuizQuestion}>
                <Text style={styles.primaryButtonText}>
                  {quizIndex + 1 >= quizQuestions.length ? 'Continue' : 'Next'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  !(selectedAnswer || fillAnswer.trim()) && styles.buttonDisabled,
                ]}
                onPress={submitQuizAnswer}
                disabled={!(selectedAnswer || fillAnswer.trim())}
              >
                <Text style={styles.primaryButtonText}>Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ── Translation Phase ──
  if (phase === 'translation') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <SafeAreaView style={styles.container} edges={['bottom']}>
          {/* Phase indicator */}
          <View style={styles.phaseBar}>
            <View style={[styles.phaseDot, styles.phaseDotDone]} />
            <View style={[styles.phaseLine, styles.phaseLineDone]} />
            <View style={[styles.phaseDot, styles.phaseDotDone]} />
            <View style={[styles.phaseLine, styles.phaseLineDone]} />
            <View style={[styles.phaseDot, styles.phaseDotActive]} />
          </View>

          <ScrollView contentContainerStyle={styles.translationContainer}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>Translation Challenge</Text>
            </View>

            {translationLoading && !translationExercise && (
              <View style={styles.centeredInline}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Generating sentence with AI...</Text>
              </View>
            )}

            {translationExercise && (
              <>
                {/* French sentence */}
                <Text style={styles.translationPrompt}>
                  Translate this sentence to English:
                </Text>
                <View style={styles.frenchSentenceBox}>
                  <Text style={styles.frenchSentence}>
                    {translationExercise.frenchSentence}
                  </Text>
                  <View style={styles.relatedWordsRow}>
                    {translationExercise.relatedWords.map((w) => (
                      <View key={w} style={styles.relatedWordTag}>
                        <Text style={styles.relatedWordText}>{w}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Translation input */}
                {!translationResult && (
                  <TextInput
                    style={styles.translationInput}
                    placeholder="Type your English translation..."
                    placeholderTextColor={colors.text.tertiary}
                    value={translationInput}
                    onChangeText={setTranslationInput}
                    multiline
                    autoCorrect={false}
                    editable={!translationLoading}
                  />
                )}

                {/* Correction result */}
                {translationResult && (
                  <View style={styles.correctionContainer}>
                    <View style={[
                      styles.correctionBadge,
                      { backgroundColor: translationResult.isCorrect ? colors.success + '15' : colors.error + '15' },
                    ]}>
                      <Ionicons
                        name={translationResult.isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={24}
                        color={translationResult.isCorrect ? colors.success : colors.error}
                      />
                      <Text style={[
                        styles.correctionBadgeText,
                        { color: translationResult.isCorrect ? colors.success : colors.error },
                      ]}>
                        {translationResult.isCorrect ? 'Good translation!' : 'Needs improvement'}
                      </Text>
                    </View>

                    <View style={styles.correctionSection}>
                      <Text style={styles.correctionLabel}>Your answer:</Text>
                      <Text style={styles.correctionValue}>
                        {translationResult.userTranslation}
                      </Text>
                    </View>

                    <View style={styles.correctionSection}>
                      <Text style={styles.correctionLabel}>Corrected:</Text>
                      <Text style={[styles.correctionValue, { color: colors.success }]}>
                        {translationResult.correctedTranslation}
                      </Text>
                    </View>

                    <View style={styles.feedbackBox}>
                      <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                      <Text style={styles.feedbackText}>
                        {translationResult.feedback}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Action */}
          <View style={styles.actionContainer}>
            {translationResult ? (
              <TouchableOpacity style={styles.primaryButton} onPress={finishTranslation}>
                <Text style={styles.primaryButtonText}>See Results</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!translationInput.trim() || translationLoading) && styles.buttonDisabled,
                ]}
                onPress={submitTranslation}
                disabled={!translationInput.trim() || translationLoading}
              >
                {translationLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Check Translation</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ── Results Phase ──
  if (phase === 'results' && sessionResult) {
    const quizCorrect = sessionResult.quizResults.filter((r) => r.isCorrect).length;
    const quizTotal = sessionResult.quizResults.length;
    const quizPct = quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0;
    const reviewed = sessionResult.reviewStats.difficult + sessionResult.reviewStats.correct + sessionResult.reviewStats.easy;

    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.resultsContainer}>
          <View style={styles.resultsHeader}>
            <Ionicons name="trophy" size={48} color="#F59E0B" />
            <Text style={styles.resultsTitle}>Challenge Complete!</Text>
            <Text style={styles.resultsDeck}>{selectedDeckName}</Text>
          </View>

          {/* Review stats */}
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>Flashcard Review</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.error }]}>
                  {sessionResult.reviewStats.difficult}
                </Text>
                <Text style={styles.statLabel}>Hard</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>
                  {sessionResult.reviewStats.correct}
                </Text>
                <Text style={styles.statLabel}>OK</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: colors.success }]}>
                  {sessionResult.reviewStats.easy}
                </Text>
                <Text style={styles.statLabel}>Easy</Text>
              </View>
            </View>
            <Text style={styles.statSummary}>{reviewed} cards reviewed</Text>
          </View>

          {/* Quiz stats */}
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>Quiz</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercentage}>{quizPct}%</Text>
              <Text style={styles.scoreLabel}>
                {quizCorrect}/{quizTotal}
              </Text>
            </View>
          </View>

          {/* Translation stats */}
          {sessionResult.translationResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>Translation</Text>
              <View style={styles.translationResultRow}>
                <Ionicons
                  name={sessionResult.translationResult.isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={sessionResult.translationResult.isCorrect ? colors.success : colors.error}
                />
                <Text style={styles.translationResultText}>
                  {sessionResult.translationResult.isCorrect
                    ? 'Translation correct!'
                    : 'Translation needs work'}
                </Text>
              </View>
            </View>
          )}

          {!sessionResult.translationResult && (
            <View style={[styles.resultCard, { opacity: 0.6 }]}>
              <Text style={styles.resultCardTitle}>Translation</Text>
              <Text style={styles.skippedText}>
                Skipped (no API key configured)
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.resultsButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                resetSession();
                setPhase('deck_selection');
                loadDecks();
              }}
            >
              <Text style={styles.secondaryButtonText}>New Challenge</Text>
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

  return null;
};

// ──────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────

function getOptionStyle(
  option: string,
  selectedAnswer: string | null,
  correctAnswer: string,
  submitted: boolean,
) {
  if (submitted) {
    if (option === correctAnswer) return styles.optionCorrect;
    if (option === selectedAnswer) return styles.optionIncorrect;
    return styles.optionDefault;
  }
  if (option === selectedAnswer) return styles.optionSelected;
  return styles.optionDefault;
}

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────

const styles = StyleSheet.create({
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
  centeredInline: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text.secondary,
    fontSize: 16,
  },

  // Phase bar
  phaseBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.borderLight,
  },
  phaseDotActive: {
    backgroundColor: '#F59E0B',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  phaseDotDone: {
    backgroundColor: colors.success,
  },
  phaseLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
    marginHorizontal: 8,
  },
  phaseLineDone: {
    backgroundColor: colors.success,
  },

  // Header
  headerBox: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 28,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Deck selection
  deckList: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.warning,
    lineHeight: 18,
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 24,
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

  // Flashcard review
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  flashcardSide: {
    borderRadius: 24,
    minHeight: 260,
    overflow: 'hidden',
  },
  flashcardBack: {
    // no extra styles needed; gradient handles background
  },
  flashcardInner: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  flashcardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  flashcardWord: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
  },
  flashcardDefinition: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
  },
  contextBox: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
    width: '100%',
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  contextText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    opacity: 0.5,
  },
  flipHintText: {
    marginLeft: 6,
    fontSize: 13,
    color: colors.text.tertiary,
  },

  // Rating
  ratingContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  ratingPrompt: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rateButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 4,
  },
  rateButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Quiz
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

  // Translation
  translationContainer: {
    padding: 24,
    flexGrow: 1,
  },
  translationPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  frenchSentenceBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  frenchSentence: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 28,
    textAlign: 'center',
  },
  relatedWordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  relatedWordTag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  relatedWordText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  translationInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  correctionContainer: {
    marginTop: 8,
  },
  correctionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  correctionBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  correctionSection: {
    marginBottom: 12,
  },
  correctionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  correctionValue: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    gap: 10,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },

  // Actions
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
    justifyContent: 'center',
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

  // Results
  resultsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text.primary,
    marginTop: 12,
  },
  resultsDeck: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  resultCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statSummary: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scorePercentage: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  translationResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  translationResultText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  skippedText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  resultsButtons: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
  },
});
