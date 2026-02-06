import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/features/home/HomeScreen';
import { getDueFlashcards, getAllFlashcardsForDeck, applyReview } from '@/core/engine/reviewService';
import { colors } from '@/constants';
import type { Flashcard, QualityScore } from '@/types/models';

type ReviewScreenProps = NativeStackScreenProps<RootStackParamList, 'Review'>;

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ route, navigation }) => {
  const { deckId, deckName } = route.params;

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [totalDeckCards, setTotalDeckCards] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ difficult: 0, correct: 0, easy: 0 });

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const loadCards = useCallback(async () => {
    setLoading(true);
    const allCards = await getAllFlashcardsForDeck(deckId);
    setTotalDeckCards(allCards.length);
    const due = await getDueFlashcards(deckId);
    setCards(due);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(due.length === 0);
    setLoading(false);
  }, [deckId]);

  const practiceAll = useCallback(async () => {
    setLoading(true);
    const allCards = await getAllFlashcardsForDeck(deckId);
    setCards(allCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setStats({ difficult: 0, correct: 0, easy: 0 });
    setLoading(false);
  }, [deckId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

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
    if (!currentCard) return;

    // Update stats
    const key = quality === 1 ? 'difficult' : quality === 3 ? 'correct' : 'easy';
    setStats((prev) => ({ ...prev, [key]: prev[key] + 1 }));

    // Apply review via centralized service
    await applyReview({
      flashcardId: currentCard.id,
      quality,
      source: 'flashcard',
    });

    // Animate slide out
    Animated.timing(slideAnim, {
      toValue: -400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Move to next card
      if (currentIndex + 1 >= cards.length) {
        setSessionComplete(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
        flipAnim.setValue(0);
      }
      slideAnim.setValue(0);
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

  if (sessionComplete) {
    const total = stats.difficult + stats.correct + stats.easy;
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
              <StatBadge label="Difficult" count={stats.difficult} color="#EF4444" />
              <StatBadge label="Correct" count={stats.correct} color="#F59E0B" />
              <StatBadge label="Easy" count={stats.easy} color="#10B981" />
            </View>
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
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryButtonText}>Back to Deck</Text>
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
              <Text style={styles.cardWord}>{currentCard?.word}</Text>
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
              <Text style={styles.cardLabel}>DEFINITION</Text>
              <Text style={styles.cardDefinition}>{currentCard?.definition}</Text>
              {currentCard?.context && (
                <View style={styles.contextContainer}>
                  <Text style={styles.contextLabel}>CONTEXT</Text>
                  <Text style={styles.contextText}>{currentCard.context}</Text>
                </View>
              )}
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Rating buttons (visible only when flipped) */}
      {isFlipped && (
        <View style={styles.ratingContainer}>
          <RatingButton
            label="Difficult"
            icon="close-circle"
            color="#EF4444"
            onPress={() => handleRate(1)}
          />
          <RatingButton
            label="Correct"
            icon="checkmark-circle"
            color="#F59E0B"
            onPress={() => handleRate(3)}
          />
          <RatingButton
            label="Easy"
            icon="star"
            color="#10B981"
            onPress={() => handleRate(5)}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

/** Stat badge for completion screen */
const StatBadge: React.FC<{ label: string; count: number; color: string }> = ({
  label,
  count,
  color,
}) => (
  <View style={[styles.statBadge, { backgroundColor: color + '15' }]}>
    <Text style={[styles.statCount, { color }]}>{count}</Text>
    <Text style={[styles.statLabel, { color }]}>{label}</Text>
  </View>
);

/** Rating button component */
const RatingButton: React.FC<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}> = ({ label, icon, color, onPress }) => (
  <TouchableOpacity
    style={[styles.ratingButton, { backgroundColor: color + '15', borderColor: color + '30' }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons name={icon} size={28} color={color} />
    <Text style={[styles.ratingLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

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
});
