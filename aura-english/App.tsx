import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, RootStackParamList } from '@/features/home/HomeScreen';
import { DeckDetailScreen } from '@/features/decks/DeckDetailScreen';
import { DeckListScreen  } from '@/features/decks/DeckListScreen';
import { FlashcardFormScreen } from '@/features/flashcards/FlashcardFormScreen';
import { QuizScreen } from '@/features/quiz';
import { ReviewScreen } from '@/features/review';
import { ChallengeScreen } from '@/features/challenge';
import { GrammarHomeScreen, GrammarCategoryScreen, GrammarRuleScreen } from '@/features/grammar';
import { getCategoryById, getRuleById } from '@/data/grammar';
import { SettingsScreen } from '@/features/settings';
import { colors } from '@/constants';
import { getDatabase } from '@/core/database';
import './global.css';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDatabase()
      .then(() => setIsDbReady(true))
      .catch((err) => {
        console.error('Database initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      });
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: '#ef4444', fontSize: 16, marginBottom: 8 }}>Database Error</Text>
        <Text style={{ color: colors.text.primary, fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!isDbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text.primary, marginTop: 16, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: true,
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Deck" component={DeckListScreen} options={{ title: 'My Decks' }} />
        <Stack.Screen
          name="DeckDetail"
          component={DeckDetailScreen}
          options={({ route }) => ({ title: route.params.deckName })}
        />
        <Stack.Screen
          name="FlashcardForm"
          component={FlashcardFormScreen}
          options={({ route }) => ({ title: route.params.mode === 'edit' ? 'Edit Card' : 'New Card' })}
        />
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={({ route }) => ({ title: `Review: ${route.params.deckName}` })}
        />
        <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ title: 'Challenge' }} />
        <Stack.Screen name="Grammar" component={GrammarHomeScreen} options={{ title: 'Grammar' }} />
        <Stack.Screen
          name="GrammarCategory"
          component={GrammarCategoryScreen}
          options={({ route }) => ({
            title: getCategoryById(route.params.categoryId)?.title ?? 'Category',
          })}
        />
        <Stack.Screen
          name="GrammarRule"
          component={GrammarRuleScreen}
          options={({ route }) => ({
            title: getRuleById(route.params.ruleId)?.title ?? 'Grammar Rule',
          })}
        />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
