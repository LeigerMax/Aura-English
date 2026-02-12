import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/features/home/HomeScreen';
import { FlashcardCard, QRShareModal } from '@/components/ui';
import { useTheme } from '@/core/theme';
import { sizes } from '@/constants';
import type { ThemeColors } from '@/core/theme';
import { deckRepository, flashcardRepository } from '@/data/repositories';
import { FLASHCARD_PAGE_SIZE } from '@/data/repositories/flashcardRepository';
import { GLOBAL_DECK_ID } from '@/core/database/schema';
import { exportDeck } from '@/core/services/exportService';
import type { Deck, Flashcard } from '@/types/models';

type DeckDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'DeckDetail'>;

export const DeckDetailScreen: React.FC<DeckDetailScreenProps> = ({ navigation, route }) => {
  const { deckId } = route.params;
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [deck, setDeck] = React.useState<Deck | null>(null);
  const [flashcards, setFlashcards] = React.useState<Flashcard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Flashcard[] | null>(null);
  const [searching, setSearching] = React.useState(false);
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [showQRModal, setShowQRModal] = React.useState(false);

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

      const firstPage = await flashcardRepository.getFlashcardsByDeckPaginated(deckId, FLASHCARD_PAGE_SIZE, 0);
      setFlashcards(firstPage);
      setHasMore(firstPage.length >= FLASHCARD_PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load deck data:', error);
      Alert.alert('Error', 'Failed to load deck data');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = await flashcardRepository.getFlashcardsByDeckPaginated(
        deckId,
        FLASHCARD_PAGE_SIZE,
        flashcards.length,
      );
      setFlashcards((prev) => [...prev, ...nextPage]);
      setHasMore(nextPage.length >= FLASHCARD_PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load more flashcards:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAddCard = () => {
    navigation.navigate('FlashcardForm', { deckId, mode: 'create' });
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportDeck(deckId);
    } catch (err) {
      Alert.alert('Export Failed', err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteDeck = () => {
    if (deckId === GLOBAL_DECK_ID) return;
    Alert.alert(
      'Delete Deck',
      `Are you sure you want to delete "${deck?.name}"? This will remove the deck but keep the flashcards.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deckRepository.deleteDeck(deckId);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete deck:', error);
              Alert.alert('Error', 'Failed to delete deck');
            }
          },
        },
      ]
    );
  };

  // ── Search ──
  const handleSearchChange = React.useCallback((text: string) => {
    setSearchQuery(text);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!text.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    // Longer debounce so the user can finish typing
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        // Search only by word (not definition/context)
        const results = await flashcardRepository.searchFlashcardsByWord(text.trim());
        // If we're in a specific deck (not global), filter results to this deck
        if (deckId !== GLOBAL_DECK_ID) {
          const allDeckCards = await flashcardRepository.getFlashcardsByDeck(deckId);
          const deckIds = new Set(allDeckCards.map((f) => f.id));
          setSearchResults(results.filter((r) => deckIds.has(r.id)));
        } else {
          setSearchResults(results);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 600);
  }, [deckId]);

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

  const totalCount = deck?.cardCount ?? flashcards.length;

  const renderItem = React.useCallback(
    ({ item }: { item: Flashcard }) => (
      <FlashcardCard
        flashcard={item}
        onEdit={handleEditCard}
        onDelete={handleDeleteCard}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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

  const renderHeader = () => (
    <View>
      {/* Deck Info */}
      {deck && (
        <View style={[styles.deckInfo, { backgroundColor: deck.color }]}>
          <Text style={styles.deckName}>{deck.name}</Text>
          {deck.description && (
            <Text style={styles.deckDescription}>{deck.description}</Text>
          )}
          <Text style={styles.cardCount}>
            {totalCount} {totalCount === 1 ? 'card' : 'cards'}
          </Text>
        </View>
      )}

      {/* Search Bar */}
      {totalCount > 0 && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} style={{ marginRight: sizes.spacing.sm }} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search words..."
            placeholderTextColor={colors.text.tertiary}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearchChange('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Search status */}
      {searching && (
        <View style={{ paddingVertical: sizes.spacing.sm, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      {searchResults !== null && !searching && (
        <Text style={styles.searchResultsLabel}>
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
        </Text>
      )}

      {/* Add Card Button */}
      {searchResults === null && (
        <TouchableOpacity
          style={[styles.addButton, { borderColor: deck?.color || colors.primary }]}
          onPress={handleAddCard}
        >
          <Text style={styles.addButtonIcon}>➕</Text>
          <Text style={styles.addButtonText}>Add New Card</Text>
        </TouchableOpacity>
      )}

      {/* Review Button */}
      {totalCount > 0 && searchResults === null && (
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

      {/* Export & Share actions — only for real decks with cards */}
      {deckId !== GLOBAL_DECK_ID && totalCount > 0 && searchResults === null && (
        <View style={styles.shareRow}>
          <TouchableOpacity
            style={[styles.shareActionButton, { backgroundColor: colors.secondary }]}
            onPress={handleExport}
            disabled={exporting}
            activeOpacity={0.7}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <>
                <Ionicons name="share-outline" size={18} color={colors.text.inverse} />
                <Text style={styles.shareActionText}>Export</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareActionButton, { backgroundColor: colors.info }]}
            onPress={() => setShowQRModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="qr-code-outline" size={18} color={colors.text.inverse} />
            <Text style={styles.shareActionText}>QR Share</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Deck — only for user-created decks */}
      {deckId !== GLOBAL_DECK_ID && searchResults === null && (
        <TouchableOpacity
          style={styles.deleteDeckButton}
          onPress={handleDeleteDeck}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
          <Text style={[styles.deleteDeckButtonText, { color: colors.error }]}>Delete Deck</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
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
  );

  const displayedCards = searchResults ?? flashcards;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={displayedCards}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onEndReached={searchResults === null ? loadMore : undefined}
        onEndReachedThreshold={0.4}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={7}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      />

      {/* QR Share Modal */}
      <QRShareModal
        visible={showQRModal}
        deckId={deckId}
        deckName={deck?.name ?? ''}
        onClose={() => setShowQRModal(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: sizes.radius.xl,
    paddingHorizontal: sizes.spacing.md,
    paddingVertical: sizes.spacing.sm,
    marginBottom: sizes.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: sizes.fontSize.md,
    color: colors.text.primary,
    paddingVertical: sizes.spacing.xs,
  },
  searchResultsLabel: {
    fontSize: sizes.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: sizes.spacing.md,
    fontStyle: 'italic',
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
  footerLoader: {
    paddingVertical: sizes.spacing.lg,
    alignItems: 'center',
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
  shareRow: {
    flexDirection: 'row',
    gap: sizes.spacing.sm,
    marginBottom: sizes.spacing.xl,
  },
  shareActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.spacing.md,
    borderRadius: sizes.radius.xl,
    gap: sizes.spacing.xs,
  },
  shareActionText: {
    fontSize: sizes.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteDeckButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sizes.spacing.md,
    borderRadius: sizes.radius.xl,
    borderWidth: 1,
    borderColor: colors.error,
    marginBottom: sizes.spacing.xl,
    gap: sizes.spacing.xs,
  },
  deleteDeckButtonText: {
    fontSize: sizes.fontSize.md,
    fontWeight: '600',
  },
});
