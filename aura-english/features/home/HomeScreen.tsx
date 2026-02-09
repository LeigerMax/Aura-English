import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { Flashcard } from '@/types/models';
import { useTheme } from '@/core/theme';

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Deck: undefined;
  DeckDetail: { deckId: string; deckName: string };
  FlashcardForm: {
    deckId: string;
    mode: 'create' | 'edit';
    flashcard?: Flashcard;
  };
  Review: { deckId: string; deckName: string };
  Quiz: undefined;
  Challenge: undefined;
  Grammar: undefined;
  GrammarCategory: { categoryId: string };
  GrammarRule: { ruleId: string };
  Settings: undefined;
  ApiKeyTutorial: undefined;
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface ModuleConfig {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  iconName: keyof typeof Ionicons.glyphMap;
  route: keyof RootStackParamList;
}

const MODULES: ModuleConfig[] = [
  {
    id: 'deck',
    title: 'Decks',
    subtitle: 'Organize your flashcards',
    color: '#5B5FE5',
    iconName: 'albums',
    route: 'Deck',
  },
  {
    id: 'quiz',
    title: 'Quiz',
    subtitle: 'Test your knowledge',
    color: '#10B981',
    iconName: 'checkmark-circle',
    route: 'Quiz',
  },
  {
    id: 'challenge',
    title: 'Challenge',
    subtitle: 'Daily practice',
    color: '#F59E0B',
    iconName: 'trophy',
    route: 'Challenge',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    subtitle: 'Master the rules',
    color: '#8B5CF6',
    iconName: 'book',
    route: 'Grammar',
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Customize app',
    color: '#6B7280',
    iconName: 'settings',
    route: 'Settings',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleModulePress = (route: keyof RootStackParamList) => {
    if (route === 'DeckDetail' || route === 'FlashcardForm') {
      navigation.navigate('Deck');
    } else {
      navigation.navigate(route as any);
    }
  };

  const { isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#111827' : '#F9FAFB'} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 pt-8 pb-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center mb-2">
            <View className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xl font-bold">A</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              Aura English
            </Text>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 text-base ml-13">
            Your English learning assistant
          </Text>
        </View>


        {/* Modules Grid */}
        <View className="px-6 py-6">
          <Text className="text-gray-900 dark:text-gray-50 text-xl font-bold mb-4">
            Learning Modules
          </Text>

          <View className="flex-row flex-wrap -mx-2">
            {MODULES.map((module) => (
              <View key={module.id} className="w-1/2 px-2 mb-4">
                <TouchableOpacity
                  onPress={() => handleModulePress(module.route)}
                  activeOpacity={0.7}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm"
                  style={{
                    shadowColor: module.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                    style={{ backgroundColor: module.color + '20' }}
                  >
                    <Ionicons name={module.iconName} size={28} color={module.color} />
                  </View>
                  <Text className="text-gray-900 dark:text-gray-50 font-bold text-base mb-1">
                    {module.title}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs leading-4">
                    {module.subtitle}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Action Card */}
        <View className="mx-6 mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('Deck')}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 flex-row items-center shadow-sm"
            activeOpacity={0.7}
          >
            <View className="bg-primary-50 rounded-full p-3 mr-4">
              <Ionicons name="add" size={24} color="#5B5FE5" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 dark:text-gray-50 font-bold text-base mb-1">
                Create a new flashcard
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                Add vocabulary to your decks
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center py-8">
          <Text className="text-gray-400 dark:text-gray-500 text-sm">
            Keep learning every day 🚀
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
