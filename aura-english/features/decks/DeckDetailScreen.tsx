import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/features/home/HomeScreen';
import { FlashcardCard } from '@/components/ui';
import { colors, sizes } from '@/constants';
import { deckRepository, flashcardRepository } from '@/data/repositories';
import { GLOBAL_DECK_ID } from '@/core/database/schema';
import type { Deck, Flashcard } from '@/types/models';

type DeckDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'DeckDetail'>;

export const DeckDetailScreen: React.FC<DeckDetailScreenProps> = ({ navigation, route }) => {
  const { deckId } = route.params;

  const [deck, setDeck] = React.useState<Deck | null>(null);
  const [flashcards, setFlashcards] = React.useState<Flashcard[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDeckData();
  }, [deckId]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDeckData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDeckData = async () => {
    try {
      setLoading(true);

      const deckData = deckId === GLOBAL_DECK_ID
        ? await deckRepository.getGlobalDeck()
        : await deckRepository.getDeckById(deckId);
      if (!deckData) {
        Alert.alert('Error', 'Deck not found');
        navigation.goBack();
        return;
      }
      setDeck(deckData);

      const cards = await flashcardRepository.getFlashcardsByDeck(deckId);
      setFlashcards(cards);
    } catch (error) {
      console.error('Failed to load deck data:', error);
      Alert.alert('Error', 'Failed to load deck data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = () => {
    navigation.navigate('FlashcardForm', { deckId, mode: 'create' });
  };

  const handleEditCard = (flashcard: Flashcard) => {
    navigation.navigate('FlashcardForm', { deckId, mode: 'edit', flashcard });
  };

  const handleDeleteCard = (flashcard: Flashcard) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${flashcard.word}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await flashcardRepository.deleteFlashcard(flashcard.id);
              await loadDeckData();
            } catch (error) {
              console.error('Failed to delete flashcard:', error);
              Alert.alert('Error', 'Failed to delete flashcard');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Deck Info */}
        {deck && (
          <View style={[styles.deckInfo, { backgroundColor: deck.color }]}>
            <Text style={styles.deckName}>{deck.name}</Text>
            {deck.description && (
              <Text style={styles.deckDescription}>{deck.description}</Text>
            )}
            <Text style={styles.cardCount}>
              {flashcards.length} {flashcards.length === 1 ? 'card' : 'cards'}
            </Text>
          </View>
        )}

        {/* Add Card Button */}
        <TouchableOpacity
          style={[styles.addButton, { borderColor: deck?.color || colors.primary }]}
          onPress={handleAddCard}
        >
          <Text style={styles.addButtonIcon}>➕</Text>
          <Text style={styles.addButtonText}>Add New Card</Text>
        </TouchableOpacity>

        {/* Review Button */}
        {flashcards.length > 0 && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() =>
              navigation.navigate('Review', {
                deckId,
                deckName: deck?.name ?? 'Review',
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.reviewButtonIcon}>🧠</Text>
            <Text style={styles.reviewButtonText}>Start Review</Text>
          </TouchableOpacity>
        )}

        {/* Flashcards */}
        {flashcards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎴</Text>
            <Text style={styles.emptyTitle}>No flashcards yet</Text>
            <Text style={styles.emptyText}>
              Create your first flashcard to start learning
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: deck?.color || colors.primary }]}
              onPress={handleAddCard}
            >
              <Text style={styles.emptyButtonText}>Create Flashcard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.flashcardsContainer}>
            {flashcards.map((flashcard) => (
              <FlashcardCard
                key={flashcard.id}
                flashcard={flashcard}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: sizes.container.padding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: sizes.spacing.md,
    fontSize: sizes.fontSize.md,
    color: colors.text.secondary,
  },
  deckInfo: {
    padding: sizes.spacing.lg,
    borderRadius: sizes.radius.xl,
    marginBottom: sizes.spacing.lg,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  deckName: {
    fontSize: sizes.fontSize.xxl,
    fontWeight: '700',
    color: colors.text.inverse,
    marginBottom: sizes.spacing.xs,
  },
  deckDescription: {
    fontSize: sizes.fontSize.md,
    color: colors.text.inverse,
    opacity: 0.9,
    marginBottom: sizes.spacing.sm,
    lineHeight: sizes.fontSize.md * 1.4,
  },
  cardCount: {
    fontSize: sizes.fontSize.sm,
    color: colors.text.inverse,
    opacity: 0.8,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizes.spacing.lg,
    borderRadius: sizes.radius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: sizes.spacing.xl,
    backgroundColor: colors.surface,
  },
  addButtonIcon: {
    fontSize: sizes.fontSize.xl,
    marginRight: sizes.spacing.sm,
  },
  addButtonText: {
    fontSize: sizes.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: sizes.spacing.lg,
    borderRadius: sizes.radius.xl,
    marginBottom: sizes.spacing.xl,
    backgroundColor: colors.primary,
  },
  reviewButtonIcon: {
    fontSize: sizes.fontSize.xl,
    marginRight: sizes.spacing.sm,
  },
  reviewButtonText: {
    fontSize: sizes.fontSize.lg,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  flashcardsContainer: {
    marginBottom: sizes.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: sizes.spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: sizes.radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    marginTop: sizes.spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: sizes.spacing.md,
  },
  emptyTitle: {
    fontSize: sizes.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: sizes.spacing.sm,
  },
  emptyText: {
    fontSize: sizes.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: sizes.spacing.lg,
    lineHeight: sizes.fontSize.md * 1.5,
  },
  emptyButton: {
    paddingHorizontal: sizes.spacing.xl,
    paddingVertical: sizes.spacing.md,
    borderRadius: sizes.radius.lg,
  },
  emptyButtonText: {
    color: colors.text.inverse,
    fontSize: sizes.fontSize.md,
    fontWeight: '600',
  },
});
