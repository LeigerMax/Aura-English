import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
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
import { ThemeProvider, useTheme, loadThemePreference } from '@/core/theme';
import type { ThemeMode, ThemeColors } from '@/core/theme';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { getDatabase } from '@/core/database';
import { seedDefaultDecks } from '@/core/services/seedService';
import './global.css';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Build a React Navigation theme from our palette. */
function buildNavTheme(colors: ThemeColors, isDark: boolean): Theme {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text.primary,
      border: colors.border,
      notification: colors.error,
    },
  };
}

/** Inner app — consumes ThemeContext. */
function AppContent() {
  const { colors, isDark } = useTheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const navTheme = React.useMemo(() => buildNavTheme(colors, isDark), [colors, isDark]);

  // Sync NativeWind dark mode with our theme context
  React.useEffect(() => {
    setColorScheme(isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <NavigationContainer theme={navTheme}>
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

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialTheme, setInitialTheme] = useState<ThemeMode>('system');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getDatabase().then(async (db) => { await seedDefaultDecks(db); }),
      loadThemePreference(),
    ])
      .then(([, mode]) => {
        setInitialTheme(mode);
        setIsReady(true);
      })
      .catch((err) => {
        console.error('App initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      });
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <Text style={{ color: '#ef4444', fontSize: 16, marginBottom: 8 }}>Initialization Error</Text>
        <Text style={{ color: '#111827', fontSize: 14, textAlign: 'center', paddingHorizontal: 20 }}>
          {error}
        </Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ color: '#111827', marginTop: 16, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider initialMode={initialTheme}>
      <AppContent />
    </ThemeProvider>
  );
}
