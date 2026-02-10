import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/features/home/HomeScreen';
import { getDueFlashcards, getAllFlashcardsForDeck, applyReview } from '@/core/engine/reviewService';
import { deckRepository } from '@/data/repositories';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import type { Deck, Flashcard, QualityScore } from '@/types/models';

/** Max cards per review session */
const REVIEW_SESSION_SIZE = 20;

type ReviewScreenProps = NativeStackScreenProps<RootStackParamList, 'Review'>;

type ReviewPhase = 'deck_selection' | 'reviewing';

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ route, navigation }) => {
  const deckId = route.params?.deckId;
  const deckName = route.params?.deckName;

  // When navigated from Home without params → show deck selection first
  const [phase, setPhase] = useState<ReviewPhase>(deckId ? 'reviewing' : 'deck_selection');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(deckId ?? null);
  const [selectedDeckName, setSelectedDeckName] = useState<string>(deckName ?? '');

  // Update navigation title when deck is selected
  useEffect(() => {
    if (selectedDeckName) {
      navigation.setOptions({ title: `Review: ${selectedDeckName}` });
    }
  }, [selectedDeckName, navigation]);
  const [availableDecks, setAvailableDecks] = useState<Deck[]>([]);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [allDueCards, setAllDueCards] = useState<Flashcard[]>([]);
  const [totalDeckCards, setTotalDeckCards] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ difficult: 0, correct: 0, easy: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // Load available decks for the selection phase
  const loadDecks = useCallback(async () => {
    setLoading(true);
    const [globalDeck, userDecks] = await Promise.all([
      deckRepository.getGlobalDeck(),
      deckRepository.getAllDecks(),
    ]);
    setAvailableDecks([globalDeck, ...userDecks]);
    setLoading(false);
  }, []);

  const loadCards = useCallback(async (dId: string) => {
    setLoading(true);
    const allCards = await getAllFlashcardsForDeck(dId);
    setTotalDeckCards(allCards.length);
    const due = await getDueFlashcards(dId);
    setAllDueCards(due);
    // Limit to REVIEW_SESSION_SIZE per session
    const sessionCards = due.slice(0, REVIEW_SESSION_SIZE);
    setCards(sessionCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsAnimating(false);
    setSessionComplete(sessionCards.length === 0);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
    setLoading(false);
  }, [flipAnim, slideAnim]);

  /** Continue with the next batch of due cards */
  const continueReview = useCallback(async () => {
    if (!selectedDeckId) return;
    setLoading(true);
    // Re-fetch due cards (some may no longer be due after the last session)
    const due = await getDueFlashcards(selectedDeckId);
    setAllDueCards(due);
    const sessionCards = due.slice(0, REVIEW_SESSION_SIZE);
    setCards(sessionCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsAnimating(false);
    setSessionComplete(sessionCards.length === 0);
    setStats({ difficult: 0, correct: 0, easy: 0 });
    flipAnim.setValue(0);
    slideAnim.setValue(0);
    setLoading(false);
  }, [selectedDeckId, flipAnim, slideAnim]);

  const practiceAll = useCallback(async () => {
    if (!selectedDeckId) return;
    setLoading(true);
    const allCards = await getAllFlashcardsForDeck(selectedDeckId);
    // Also limit practice-all to REVIEW_SESSION_SIZE
    setCards(allCards.slice(0, REVIEW_SESSION_SIZE));
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setIsAnimating(false);
    setStats({ difficult: 0, correct: 0, easy: 0 });
    flipAnim.setValue(0);
    slideAnim.setValue(0);
    setLoading(false);
  }, [selectedDeckId, flipAnim, slideAnim]);

  const handleSelectDeck = useCallback((deck: Deck) => {
    setSelectedDeckId(deck.id);
    setSelectedDeckName(deck.name);
    setPhase('reviewing');
    loadCards(deck.id);
  }, [loadCards]);

  useEffect(() => {
    if (phase === 'deck_selection') {
      loadDecks();
    } else if (selectedDeckId) {
      loadCards(selectedDeckId);
    }
  }, [phase, selectedDeckId, loadDecks, loadCards]);

  const currentCard = cards[currentIndex];
  const remaining = cards.length - currentIndex;

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
    if (!currentCard || isAnimating) return;
    setIsAnimating(true);

    // Update stats
    const key = quality === 1 ? 'difficult' : quality === 3 ? 'correct' : 'easy';
    setStats((prev) => ({ ...prev, [key]: prev[key] + 1 }));

    // Apply review via centralized service
    await applyReview({
      flashcardId: currentCard.id,
      quality,
      source: 'flashcard',
    });

    // Animate slide out to the left
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Move to next card
      if (currentIndex + 1 >= cards.length) {
        setSessionComplete(true);
        setIsAnimating(false);
      } else {
        // Update card state while off-screen
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
        flipAnim.setValue(0);

        // Slide new card in from the right
        slideAnim.setValue(400);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          setIsAnimating(false);
        });
      }
    });
  };

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  const frontScale = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.95, 0.95],
  });
  const backScale = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.95, 0.95, 1],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading cards...</Text>
      </SafeAreaView>
    );
  }

  // --- Deck selection phase ---
  if (phase === 'deck_selection') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.deckSelectionList}>
          <Text style={styles.deckSelectionTitle}>Choose a deck to review</Text>
          {availableDecks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={styles.deckSelectionItem}
              onPress={() => handleSelectDeck(deck)}
              activeOpacity={0.7}
            >
              <View style={[styles.deckColorDot, { backgroundColor: deck.color }]} />
              <View style={styles.deckSelectionInfo}>
                <Text style={styles.deckSelectionName}>{deck.name}</Text>
                <Text style={styles.deckSelectionCount}>
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

  if (sessionComplete) {
    const total = stats.difficult + stats.correct + stats.easy;
    const remainingDue = allDueCards.length - total;
    const hasMoreDueCards = remainingDue > 0;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completionContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          <Text style={styles.completionTitle}>Session Complete!</Text>
          <Text style={styles.completionSubtitle}>
            {total === 0
              ? 'No cards due for review right now.'
              : `You reviewed ${total} card${total !== 1 ? 's' : ''}`}
          </Text>

          {total > 0 && (
            <View style={styles.statsContainer}>
              <View style={[styles.statBadge, { backgroundColor: '#EF4444' + '15' }]}>
                <Text style={[styles.statCount, { color: '#EF4444' }]}>{stats.difficult}</Text>
                <Text style={[styles.statLabel, { color: '#EF4444' }]}>Difficult</Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: '#F59E0B' + '15' }]}>
                <Text style={[styles.statCount, { color: '#F59E0B' }]}>{stats.correct}</Text>
                <Text style={[styles.statLabel, { color: '#F59E0B' }]}>Correct</Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: '#10B981' + '15' }]}>
                <Text style={[styles.statCount, { color: '#10B981' }]}>{stats.easy}</Text>
                <Text style={[styles.statLabel, { color: '#10B981' }]}>Easy</Text>
              </View>
            </View>
          )}

          {/* Continue reviewing next batch if more due cards exist */}
          {hasMoreDueCards && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={continueReview}
            >
              <Text style={styles.primaryButtonText}>
                Continue ({remainingDue} more due)
              </Text>
            </TouchableOpacity>
          )}

          {totalDeckCards > 0 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={practiceAll}
            >
              <Text style={styles.secondaryButtonText}>Practice all cards</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.secondaryButton, { marginTop: 12 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex) / cards.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {remaining} card{remaining !== 1 ? 's' : ''} remaining
        </Text>
      </View>

      {/* Card */}
      <Animated.View style={[styles.cardWrapper, { transform: [{ translateX: slideAnim }] }]}>
        <TouchableOpacity onPress={handleFlip} activeOpacity={0.9}>
          <View>
            {/* Front */}
            <Animated.View
              style={[
                styles.card,
                styles.cardFront,
                { opacity: frontOpacity, transform: [{ scale: frontScale }] },
              ]}
            >
              <Text style={styles.cardLabel}>WORD</Text>
              <Text style={styles.cardWord} adjustsFontSizeToFit numberOfLines={2}>{currentCard?.word}</Text>
              <Text style={styles.tapHint}>Tap to reveal</Text>
            </Animated.View>

            {/* Back */}
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                { opacity: backOpacity, transform: [{ scale: backScale }] },
              ]}
            >
              <ScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.cardLabel}>DEFINITION</Text>
                <Text style={styles.cardDefinition} adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={5}>{currentCard?.definition}</Text>
                {currentCard?.context && (
                  <View style={styles.contextContainer}>
                    <Text style={styles.contextLabel}>CONTEXT</Text>
                    <Text style={styles.contextText} numberOfLines={4}>{currentCard.context}</Text>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Rating buttons (visible only when flipped) */}
      {isFlipped && (
        <View style={styles.ratingContainer}>
          <TouchableOpacity
            style={[styles.ratingButton, { backgroundColor: '#EF4444' + '15', borderColor: '#EF4444' + '30' }]}
            onPress={() => handleRate(1)}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={28} color="#EF4444" />
            <Text style={[styles.ratingLabel, { color: '#EF4444' }]}>Difficult</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ratingButton, { backgroundColor: '#F59E0B' + '15', borderColor: '#F59E0B' + '30' }]}
            onPress={() => handleRate(3)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={28} color="#F59E0B" />
            <Text style={[styles.ratingLabel, { color: '#F59E0B' }]}>Correct</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ratingButton, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' + '30' }]}
            onPress={() => handleRate(5)}
            activeOpacity={0.7}
          >
            <Ionicons name="star" size={28} color="#10B981" />
            <Text style={[styles.ratingLabel, { color: '#10B981' }]}>Easy</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    minHeight: 280,
    borderRadius: 24,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFront: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardBack: {
    backgroundColor: colors.surface,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardWord: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  cardDefinition: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 32,
  },
  contextContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    width: '100%',
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  contextText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  tapHint: {
    marginTop: 24,
    color: colors.text.tertiary,
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  ratingButton: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 100,
  },
  ratingLabel: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 24,
  },
  completionSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 12,
  },
  statBadge: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: 90,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 24,
    backgroundColor: colors.surfaceLight,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  // Deck selection styles
  deckSelectionList: {
    padding: 24,
  },
  deckSelectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  deckSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  deckColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  deckSelectionInfo: {
    flex: 1,
  },
  deckSelectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deckSelectionCount: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
