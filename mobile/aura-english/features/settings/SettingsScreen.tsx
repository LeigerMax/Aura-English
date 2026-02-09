import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/core/theme';
import type { ThemeMode, ThemeColors } from '@/core/theme';
import Constants from 'expo-constants';
import { RootStackParamList } from '@/features/home/HomeScreen';
import {
  AI_PROVIDERS,
  getActiveProvider,
  setActiveProvider as persistActiveProvider,
  saveProviderKey,
  getProviderKey,
  deleteProviderKey,
  hasProviderKey,
} from '@/core/services/aiProviderService';
import {
  getNotificationSettings,
  isSoundEnabled,
  setSoundEnabled,
} from '@/core/services/settingsService';
import {
  updateNotificationSchedule,
  requestPermissions,
} from '@/core/services/notificationService';
import type { AIProviderType } from '@/types/models';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

/**
 * SettingsScreen
 *
 * Allows the user to:
 * - Select AI provider and manage per-provider API keys
 * - Toggle notification schedule for Daily Word
 * - Toggle sound effects
 * - Access the Gemini API key tutorial
 * - Switch theme
 */
export const SettingsScreen: React.FC = () => {
  const { colors, themeMode, setThemeMode } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  // AI provider state
  const [activeProvider, setActiveProvider] = useState<AIProviderType>('gemini');
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [saving, setSaving] = useState(false);

  // Notification state
  const [notifEnabled, setNotifEnabled] = useState(false);

  // Sound state
  const [soundOn, setSoundOn] = useState(true);

  const [loading, setLoading] = useState(true);

  // ── Load all settings on mount ──
  const loadSettings = useCallback(async () => {
    setLoading(true);
    const [provider, notif, sound] = await Promise.all([
      getActiveProvider(),
      getNotificationSettings(),
      isSoundEnabled(),
    ]);
    setActiveProvider(provider);
    setNotifEnabled(notif.enabled);
    setSoundOn(sound);
    await refreshKeyStatus(provider);
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // ── Per-provider key status ──
  const refreshKeyStatus = async (provider?: AIProviderType) => {
    const target = provider ?? activeProvider;
    const stored = await hasProviderKey(target);
    setHasKey(stored);
    if (stored) {
      const key = await getProviderKey(target);
      if (key && key.length > 8) {
        setMaskedKey(`${key.slice(0, 4)}${'•'.repeat(key.length - 8)}${key.slice(-4)}`);
      } else {
        setMaskedKey('••••••••');
      }
    } else {
      setMaskedKey('');
    }
  };

  const handleSaveKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a valid API key.');
      return;
    }
    setSaving(true);
    try {
      await saveProviderKey(activeProvider, trimmed);
      setKeyInput('');
      setShowInput(false);
      await refreshKeyStatus();
      Alert.alert('Success', 'API key saved securely on your device.');
    } catch {
      Alert.alert('Error', 'Failed to save API key.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = () => {
    const label = AI_PROVIDERS.find((p) => p.type === activeProvider)?.label ?? 'provider';
    Alert.alert(
      'Delete API Key',
      `Remove the ${label} API key? AI features using this provider will be disabled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await deleteProviderKey(activeProvider);
              setHasKey(false);
              setMaskedKey('');
              setShowInput(false);
              setKeyInput('');
            })();
          },
        },
      ],
    );
  };

  const handleProviderChange = async (provider: AIProviderType) => {
    setActiveProvider(provider);
    await persistActiveProvider(provider);
    setShowInput(false);
    setKeyInput('');
    await refreshKeyStatus(provider);
  };

  // ── Notification toggle ──
  const handleNotifToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Permissions Required', 'Please allow notifications in your device settings.');
        return;
      }
    }
    setNotifEnabled(enabled);
    await updateNotificationSchedule({ enabled });
  };

  // ── Sound toggle ──
  const handleSoundToggle = async (enabled: boolean) => {
    setSoundOn(enabled);
    await setSoundEnabled(enabled);
  };

  const providerConfig = AI_PROVIDERS.find((p) => p.type === activeProvider) ?? AI_PROVIDERS[0];

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="information-circle-outline" size={22} color={colors.text.secondary} />
              <View style={styles.rowContent}>
                <Text style={styles.label}>App</Text>
                <Text style={styles.value}>Aura English v{APP_VERSION}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Text style={styles.sectionDescription}>
            Choose how the app looks. "System" follows your device settings.
          </Text>

          <View style={styles.card}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
              const isActive = themeMode === mode;
              const iconMap: Record<ThemeMode, keyof typeof Ionicons.glyphMap> = {
                light: 'sunny-outline',
                dark: 'moon-outline',
                system: 'phone-portrait-outline',
              };
              const labelMap: Record<ThemeMode, string> = {
                light: 'Light',
                dark: 'Dark',
                system: 'System',
              };

              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.themeOption,
                    isActive && { backgroundColor: colors.primary + '15' },
                    mode !== 'system' && styles.themeOptionBorder,
                  ]}
                  onPress={() => setThemeMode(mode)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.themeIconCircle,
                    { backgroundColor: isActive ? colors.primary + '20' : colors.surfaceLight },
                  ]}>
                    <Ionicons
                      name={iconMap[mode]}
                      size={20}
                      color={isActive ? colors.primary : colors.text.tertiary}
                    />
                  </View>
                  <Text style={[
                    styles.themeLabel,
                    isActive && { color: colors.primary, fontWeight: '700' },
                  ]}>
                    {labelMap[mode]}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sound Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="volume-high-outline" size={22} color={colors.text.secondary} />
              <View style={styles.rowContent}>
                <Text style={styles.label}>Sound Effects</Text>
                <Text style={styles.value}>
                  Play sounds on correct answers & challenge completion
                </Text>
              </View>
              <Switch
                value={soundOn}
                onValueChange={handleSoundToggle}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={soundOn ? colors.primary : colors.surfaceLight}
              />
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Reminders</Text>
          <Text style={styles.sectionDescription}>
            Receive 3 daily notifications (10:00, 14:00, 18:00) with a random word and its definition.
          </Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Ionicons name="notifications-outline" size={22} color={colors.text.secondary} />
              <View style={styles.rowContent}>
                <Text style={styles.label}>Notifications</Text>
                <Text style={styles.value}>
                  {notifEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={handleNotifToggle}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={notifEnabled ? colors.primary : colors.surfaceLight}
              />
            </View>
          </View>
        </View>

        {/* AI Provider Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Provider</Text>
          <Text style={styles.sectionDescription}>
            Select your AI provider and manage API keys. Only one provider
            is active at a time.
          </Text>

          {/* Provider selector */}
          <View style={styles.card}>
            {AI_PROVIDERS.map((provider, idx) => {
              const isActive = activeProvider === provider.type;
              return (
                <TouchableOpacity
                  key={provider.type}
                  style={[
                    styles.themeOption,
                    isActive && { backgroundColor: colors.primary + '15' },
                    idx < AI_PROVIDERS.length - 1 && styles.themeOptionBorder,
                  ]}
                  onPress={() => provider.available && handleProviderChange(provider.type)}
                  disabled={!provider.available}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.themeIconCircle,
                    { backgroundColor: isActive ? colors.primary + '20' : colors.surfaceLight },
                  ]}>
                    <Ionicons
                      name="sparkles-outline"
                      size={20}
                      color={isActive ? colors.primary : colors.text.tertiary}
                    />
                  </View>
                  <Text style={[
                    styles.themeLabel,
                    isActive && { color: colors.primary, fontWeight: '700' },
                    !provider.available && { color: colors.text.tertiary },
                  ]}>
                    {provider.label}
                    {!provider.available && ' (coming soon)'}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* API key management for active provider */}
          <View style={[styles.card, { marginTop: 12 }]}>
            {hasKey ? (
              <>
                <View style={styles.row}>
                  <Ionicons name="key-outline" size={22} color={colors.success} />
                  <View style={styles.rowContent}>
                    <Text style={styles.label}>{providerConfig.label} Key</Text>
                    <Text style={[styles.value, { fontFamily: 'monospace' }]}>
                      {maskedKey}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Active</Text>
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => { setShowInput(true); setKeyInput(''); }}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                    <Text style={styles.secondaryButtonText}>Replace</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteKey}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={styles.dangerButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.row}>
                  <Ionicons name="key-outline" size={22} color={colors.text.tertiary} />
                  <View style={styles.rowContent}>
                    <Text style={styles.label}>{providerConfig.label} Key</Text>
                    <Text style={[styles.value, { color: colors.text.tertiary }]}>
                      Not configured
                    </Text>
                  </View>
                </View>

                {!showInput && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setShowInput(true)}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={styles.primaryButtonText}>Add API Key</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {showInput && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={providerConfig.keyPlaceholder}
                  placeholderTextColor={colors.text.tertiary}
                  value={keyInput}
                  onChangeText={setKeyInput}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => { setShowInput(false); setKeyInput(''); }}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryButton, { flex: 1 }, !keyInput.trim() && styles.buttonDisabled]}
                    onPress={handleSaveKey}
                    disabled={!keyInput.trim() || saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Save Key</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Tutorial link */}
          <TouchableOpacity
            style={styles.tutorialLink}
            onPress={() => navigation.navigate('ApiKeyTutorial')}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.tutorialLinkText}>
              How to get an API key?
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>

          {/* Help text */}
          <View style={styles.helpBox}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.info} />
            <Text style={styles.helpText}>
              Your API key is encrypted and stored locally on your device.
              It is never sent to our servers. You can get a free Gemini API key
              at ai.google.dev.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    color: colors.text.primary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  inputContainer: {
    marginTop: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    backgroundColor: colors.surfaceLight,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: colors.error + '10',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  dangerButtonText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '10',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 10,
  },
  helpText: {
    flex: 1,
    fontSize: 13,
    color: colors.info,
    lineHeight: 18,
  },
  tutorialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 8,
  },
  tutorialLinkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },

  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 14,
  },
  themeOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  themeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
});
