import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/features/home/HomeScreen';
import { flashcardRepository, deckRepository } from '@/data/repositories';
import { GLOBAL_DECK_ID } from '@/core/database/schema';
import { Ionicons } from '@expo/vector-icons';
import { FlashcardCard } from '@/components/ui';
import type { Deck, Flashcard, CreateFlashcardInput, UpdateFlashcardInput } from '@/types/models';

type FlashcardFormScreenProps = NativeStackScreenProps<RootStackParamList, 'FlashcardForm'>;

export const FlashcardFormScreen: React.FC<FlashcardFormScreenProps> = ({ navigation, route }) => {
  const { deckId, mode, flashcard } = route.params;
  const isEditMode = mode === 'edit' && flashcard;

  const [word, setWord] = React.useState(flashcard?.word || '');
  const [definition, setDefinition] = React.useState(flashcard?.definition || '');
  const [context, setContext] = React.useState(flashcard?.context || '');
  const [selectedDeckIds, setSelectedDeckIds] = React.useState<string[]>([]);
  const [availableDecks, setAvailableDecks] = React.useState<Deck[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  React.useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setLoading(true);

      const decks = await deckRepository.getAllDecks();
      setAvailableDecks(decks);

      if (isEditMode) {
        const deckIds = await flashcardRepository.getDeckIdsForFlashcard(flashcard.id);
        setSelectedDeckIds(deckIds);
      } else if (deckId !== GLOBAL_DECK_ID) {
        setSelectedDeckIds([deckId]);
      }
    } catch (error) {
      console.error('Failed to load decks:', error);
      Alert.alert('Error', 'Failed to load decks');
    } finally {
      setLoading(false);
    }
  };

  const toggleDeck = (deckIdToToggle: string) => {
    setSelectedDeckIds((prev) =>
      prev.includes(deckIdToToggle)
        ? prev.filter((id) => id !== deckIdToToggle)
        : [...prev, deckIdToToggle]
    );
  };

  const validateForm = (): boolean => {
    if (!word.trim()) {
      Alert.alert('Error', 'Please enter a word');
      return false;
    }
    if (!definition.trim()) {
      Alert.alert('Error', 'Please enter a definition');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (isEditMode) {
        const updateInput: UpdateFlashcardInput = {
          word: word.trim(),
          definition: definition.trim(),
          context: context.trim() || undefined,
        };
        await flashcardRepository.updateFlashcard(flashcard.id, updateInput);
        await flashcardRepository.updateFlashcardDecks(flashcard.id, selectedDeckIds);
      } else {
        const createInput: CreateFlashcardInput = {
          word: word.trim(),
          definition: definition.trim(),
          context: context.trim() || undefined,
          deckIds: selectedDeckIds,
        };
        await flashcardRepository.createFlashcard(createInput);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save flashcard:', error);
      Alert.alert('Error', 'Failed to save flashcard');
    } finally {
      setSaving(false);
    }
  };

  const previewFlashcard: Flashcard = {
    id: 'preview',
    word: word || 'Word to learn',
    definition: definition || 'The definition will appear here',
    context: context || undefined,
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#5B5FE5" />
          <Text className="text-gray-600 mt-4">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="bg-white px-6 py-6 border-b border-gray-100">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Edit Card' : 'New Card'}
            </Text>
            <Text className="text-gray-500 text-base">
              Add your words, AI will complete the rest.
            </Text>
          </View>

          <View className="p-6">
            {/* Word Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2 text-base">
                Word to learn (English)
              </Text>
              <View className="bg-white rounded-2xl shadow-sm">
                <TextInput
                  value={word}
                  onChangeText={setWord}
                  placeholder="e.g. Epiphany, Serendipity..."
                  placeholderTextColor="#9CA3AF"
                  className="px-4 py-4 text-gray-900 text-base"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity className="absolute right-4 top-10 bg-primary-50 rounded-full p-2">
                <Ionicons name="sparkles" size={20} color="#5B5FE5" />
              </TouchableOpacity>
            </View>

            {/* Definition Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2 text-base">
                Definition
              </Text>
              <View className="bg-white rounded-2xl shadow-sm">
                <TextInput
                  value={definition}
                  onChangeText={setDefinition}
                  placeholder="Leave empty for AI..."
                  placeholderTextColor="#9CA3AF"
                  className="px-4 py-4 text-gray-900 text-base"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ minHeight: 100 }}
                />
              </View>
            </View>

            {/* Example Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2 text-base">
                Example
              </Text>
              <View className="bg-white rounded-2xl shadow-sm">
                <TextInput
                  value={context}
                  onChangeText={setContext}
                  placeholder="Leave empty for AI..."
                  placeholderTextColor="#9CA3AF"
                  className="px-4 py-4 text-gray-900 text-base"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{ minHeight: 80 }}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-primary-500 rounded-2xl py-4 mb-6 shadow-lg"
              style={{
                shadowColor: '#5B5FE5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center justify-center">
                  <Ionicons name="add-circle-outline" size={24} color="white" />
                  <Text className="text-white font-bold text-lg ml-2">
                    {isEditMode ? 'Save' : 'Add Flashcard'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Preview Section */}
            {word && definition && (
              <View className="mt-6">
                <View className="flex-row items-center justify-between mb-4 px-2">
                  <View className="flex-row items-center">
                    <Ionicons name="book-outline" size={20} color="#374151" />
                    <Text className="text-gray-800 font-bold text-lg ml-2">
                      Your Deck (1)
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowPreview(!showPreview)}
                    className="px-3 py-1 bg-gray-100 rounded-full"
                  >
                    <Text className="text-gray-600 text-sm font-medium">
                      {showPreview ? 'Hide' : 'Preview'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showPreview && (
                  <FlashcardCard
                    flashcard={previewFlashcard}
                    disabled={false}
                    isQuizMode={true}
                  />
                )}

                {!showPreview && (
                  <Pressable
                    onPress={() => setShowPreview(true)}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-primary-600 font-semibold text-base mb-1">
                          {word}
                        </Text>
                        <Text className="text-gray-500 text-sm" numberOfLines={2}>
                          {definition.substring(0, 60)}
                          {definition.length > 60 ? '...' : ''}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                  </Pressable>
                )}
              </View>
            )}

            {/* Deck Selection */}
            {availableDecks.length > 0 && (
              <View className="mt-8">
                <Text className="text-gray-700 font-semibold mb-3 text-base">
                  Add to decks
                </Text>
                {availableDecks.map((deck) => (
                  <TouchableOpacity
                    key={deck.id}
                    onPress={() => toggleDeck(deck.id)}
                    className="bg-white rounded-xl p-4 mb-3 flex-row items-center shadow-sm"
                  >
                    <View
                      className={`w-6 h-6 rounded-lg mr-3 items-center justify-center ${
                        selectedDeckIds.includes(deck.id)
                          ? 'bg-primary-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      {selectedDeckIds.includes(deck.id) && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text className="text-gray-900 font-medium flex-1">
                      {deck.name}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {deck.cardCount || 0} cards
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
