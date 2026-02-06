import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/features/home/HomeScreen';
import { DeckCard } from '@/components/ui';
import { colors, sizes } from '@/constants';
import { deckRepository } from '@/data/repositories';
import { DEFAULT_DECK_COLORS } from '@/core/database/schema';
import type { Deck, CreateDeckInput } from '@/types/models';

type DeckListScreenProps = NativeStackScreenProps<RootStackParamList, 'Deck'>;

export const DeckListScreen: React.FC<DeckListScreenProps> = ({ navigation }) => {
  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [globalDeck, setGlobalDeck] = React.useState<Deck | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [newDeckName, setNewDeckName] = React.useState('');
  const [newDeckDescription, setNewDeckDescription] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState<string>(DEFAULT_DECK_COLORS[0]);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    loadDecks();
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDecks();
    });
    return unsubscribe;
  }, [navigation]);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const [global, userDecks] = await Promise.all([
        deckRepository.getGlobalDeck(),
        deckRepository.getAllDecks(),
      ]);
      setGlobalDeck(global);
      setDecks(userDecks);
    } catch (error) {
      console.error('Failed to load decks:', error);
      Alert.alert('Error', 'Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) {
      Alert.alert('Error', 'Please enter a deck name');
      return;
    }

    try {
      setCreating(true);

      const input: CreateDeckInput = {
        name: newDeckName.trim(),
        description: newDeckDescription.trim() || undefined,
        color: selectedColor,
      };

      await deckRepository.createDeck(input);

      setNewDeckName('');
      setNewDeckDescription('');
      setSelectedColor(DEFAULT_DECK_COLORS[0]);
      setShowCreateModal(false);

      await loadDecks();
    } catch (error) {
      console.error('Failed to create deck:', error);
      Alert.alert('Error', 'Failed to create deck');
    } finally {
      setCreating(false);
    }
  };

  const handleDeckPress = (deck: Deck) => {
    navigation.navigate('DeckDetail', { deckId: deck.id, deckName: deck.name });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading decks...</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Decks</Text>
          <Text style={styles.subtitle}>Organize your flashcards into decks</Text>
        </View>

        {/* Global Deck */}
        {globalDeck && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 All Cards</Text>
            <DeckCard deck={globalDeck} onPress={handleDeckPress} />
          </View>
        )}

        {/* User Decks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 My Decks</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.addButtonText}>+ New Deck</Text>
            </TouchableOpacity>
          </View>

          {decks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No decks yet</Text>
              <Text style={styles.emptyText}>
                Create your first deck to organize flashcards
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.emptyButtonText}>Create Deck</Text>
              </TouchableOpacity>
            </View>
          ) : (
            decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} onPress={handleDeckPress} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Deck Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Deck</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Deck Name *</Text>
              <TextInput
                style={styles.input}
                value={newDeckName}
                onChangeText={setNewDeckName}
                placeholder="e.g., Business English"
                placeholderTextColor={colors.text.tertiary}
                autoFocus
              />

              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newDeckDescription}
                onChangeText={setNewDeckDescription}
                placeholder="What's this deck about?"
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Choose Color</Text>
              <View style={styles.colorPicker}>
                {DEFAULT_DECK_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
                disabled={creating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createButton,
                  { backgroundColor: selectedColor },
                ]}
                onPress={handleCreateDeck}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <Text style={styles.createButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    marginBottom: sizes.spacing.xl,
  },
  title: {
    fontSize: sizes.fontSize.xxxl,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: sizes.spacing.xs,
  },
  subtitle: {
    fontSize: sizes.fontSize.md,
    color: colors.text.secondary,
    lineHeight: sizes.fontSize.md * 1.4,
  },
  section: {
    marginBottom: sizes.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.spacing.md,
  },
  sectionTitle: {
    fontSize: sizes.fontSize.xl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: sizes.spacing.md,
    paddingVertical: sizes.spacing.sm,
    borderRadius: sizes.radius.lg,
  },
  addButtonText: {
    color: colors.text.inverse,
    fontSize: sizes.fontSize.sm,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: sizes.spacing.xxl,
    backgroundColor: colors.surface,
    borderRadius: sizes.radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
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
    backgroundColor: colors.primary,
    paddingHorizontal: sizes.spacing.xl,
    paddingVertical: sizes.spacing.md,
    borderRadius: sizes.radius.lg,
  },
  emptyButtonText: {
    color: colors.text.inverse,
    fontSize: sizes.fontSize.md,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: sizes.radius.xxl,
    borderTopRightRadius: sizes.radius.xxl,
    padding: sizes.spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: sizes.spacing.lg,
  },
  modalTitle: {
    fontSize: sizes.fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: sizes.fontSize.xxl,
    color: colors.text.tertiary,
    fontWeight: '300',
  },
  form: {
    marginBottom: sizes.spacing.lg,
  },
  label: {
    fontSize: sizes.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: sizes.spacing.xs,
    marginTop: sizes.spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: sizes.radius.lg,
    padding: sizes.spacing.md,
    fontSize: sizes.fontSize.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.spacing.sm,
    marginTop: sizes.spacing.sm,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: sizes.radius.lg,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.text.primary,
    transform: [{ scale: 1.1 }],
  },
  modalActions: {
    flexDirection: 'row',
    gap: sizes.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: sizes.spacing.md,
    borderRadius: sizes.radius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceLight,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: sizes.fontSize.md,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  createButtonText: {
    color: colors.text.inverse,
    fontSize: sizes.fontSize.md,
    fontWeight: '600',
  },
});
