export { saveApiKey, getApiKey, deleteApiKey, hasApiKey } from './apiKeyService';
export { generateFrenchSentence, correctTranslation } from './geminiService';
export { selectChallengeCards, DEFAULT_CHALLENGE_CARD_LIMIT } from './challengeService';
export { seedDefaultDecks } from './seedService';

// AI provider abstraction
export {
  AI_PROVIDERS,
  getProviderConfig,
  getActiveProvider,
  setActiveProvider,
  saveProviderKey,
  getProviderKey,
  deleteProviderKey,
  hasProviderKey,
  getActiveProviderKey,
} from './aiProviderService';

// Settings
export {
  getNotificationSettings,
  saveNotificationSettings,
  isSoundEnabled,
  setSoundEnabled,
} from './settingsService';

// Notifications
export {
  requestPermissions,
  scheduleDailyWord,
  cancelDailyWord,
  updateNotificationSchedule,
} from './notificationService';

// Sound
export { playSound, unloadAllSounds } from './soundService';

// Hints
export {
  getNextHint,
  MAX_HINTS,
  applyHintPenalty,
} from './hintService';

// Statistics
export {
  getGlobalStats,
  getDeckStats,
  getAllStatistics,
  sortDeckStats,
  type ScopeStats,
  type DeckStats,
  type StatisticsData,
  type DeckSortKey,
} from './statisticsService';
