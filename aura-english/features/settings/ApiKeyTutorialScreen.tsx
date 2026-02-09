import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { RootStackParamList } from '@/features/home/HomeScreen';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ApiKeyTutorial'>;

/**
 * Step-by-step tutorial guiding the user through obtaining
 * and configuring a Gemini API key inside the app.
 */

interface TutorialStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const STEPS: TutorialStep[] = [
  {
    icon: 'globe-outline',
    title: 'Open Google AI Studio',
    description:
      'Visit aistudio.google.com and sign in with your Google account. This is where Google manages free Gemini API keys.',
  },
  {
    icon: 'key-outline',
    title: 'Create an API key',
    description:
      'Click "Get API key" in the left sidebar, then "Create API key". Select or create a Google Cloud project when prompted.',
  },
  {
    icon: 'copy-outline',
    title: 'Copy your key',
    description:
      'Once the key is generated, tap the copy icon next to it. Keep this key private — never share it publicly.',
  },
  {
    icon: 'settings-outline',
    title: 'Paste it into Aura English',
    description:
      'Go to Settings → Gemini AI, tap "Add API Key", paste your key, and press Save. That\'s it!',
  },
];

const GEMINI_CONSOLE_URL = 'https://aistudio.google.com/app/apikey';

export const ApiKeyTutorialScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const openGeminiConsole = async () => {
    await WebBrowser.openBrowserAsync(GEMINI_CONSOLE_URL);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconCircle}>
            <Ionicons name="sparkles" size={32} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Set Up Gemini AI</Text>
          <Text style={styles.headerSubtitle}>
            Follow these steps to get your free API key and unlock
            AI-powered translation challenges.
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => (
            <View key={step.title} style={styles.stepRow}>
              {/* Step number + line */}
              <View style={styles.stepIndicator}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                {index < STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>

              {/* Step content */}
              <View style={styles.stepContent}>
                <View style={styles.stepIconRow}>
                  <Ionicons name={step.icon} size={20} color={colors.primary} />
                  <Text style={styles.stepTitle}>{step.title}</Text>
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* External link button */}
        <TouchableOpacity
          style={styles.linkButton}
          onPress={openGeminiConsole}
          activeOpacity={0.7}
        >
          <Ionicons name="open-outline" size={20} color="#fff" />
          <Text style={styles.linkButtonText}>Open Google AI Studio</Text>
        </TouchableOpacity>

        {/* Go to Settings */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Go to Settings</Text>
        </TouchableOpacity>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.info} />
          <Text style={styles.infoText}>
            Your API key is encrypted and stored only on your device.
            The free tier is generous — most users never exceed the limit.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 24,
    },

    // Header
    header: {
      alignItems: 'center',
      marginBottom: 32,
    },
    headerIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text.primary,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 15,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
    },

    // Steps
    stepsContainer: {
      marginBottom: 28,
    },
    stepRow: {
      flexDirection: 'row',
    },
    stepIndicator: {
      alignItems: 'center',
      width: 40,
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumber: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
    },
    stepLine: {
      flex: 1,
      width: 2,
      backgroundColor: colors.borderLight,
      marginVertical: 4,
    },
    stepContent: {
      flex: 1,
      paddingLeft: 14,
      paddingBottom: 24,
    },
    stepIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
    },
    stepDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    },

    // Buttons
    linkButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 14,
      gap: 10,
      marginBottom: 12,
    },
    linkButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryButton: {
      backgroundColor: colors.surfaceLight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 14,
      gap: 8,
      marginBottom: 24,
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },

    // Info
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.info + '10',
      borderRadius: 12,
      padding: 14,
      gap: 10,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: colors.info,
      lineHeight: 18,
    },
  });
