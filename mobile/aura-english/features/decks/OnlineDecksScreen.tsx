/**
 * OnlineDecksScreen — browse and download official decks from the website.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import { sizes } from '@/constants';
import { fetchAvailableDecks, downloadDeck } from '@/core/services/remoteDeckService';
import { importDeckFromPayload, resolveUniqueDeckName } from '@/core/services/importService';
import type { DeckMetadata, ImportResult } from '@/types/deckExport';

// ── Level badge colour map ───────────────────────────────────────────────────

const LEVEL_COLORS: Record<string, string> = {
  A1: '#10B981',
  A2: '#34D399',
  B1: '#F59E0B',
  B2: '#F97316',
  C1: '#EF4444',
  C2: '#DC2626',
};

// ── Component ────────────────────────────────────────────────────────────────

export const OnlineDecksScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [decks, setDecks] = useState<DeckMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const list = await fetchAvailableDecks();
      setDecks(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load decks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  const handleDownload = useCallback(async (meta: DeckMetadata) => {
    if (downloading.has(meta.id)) return;

    setDownloading((prev) => new Set(prev).add(meta.id));

    try {
      const payload = await downloadDeck(meta.downloadUrl);
      const uniqueName = await resolveUniqueDeckName(payload.deck.name);
      const result: ImportResult = await importDeckFromPayload(payload, uniqueName);

      Alert.alert(
        'Deck Imported! 🎉',
        `"${result.deckName}" with ${result.cardsImported} cards has been added to your library.`,
      );
    } catch (err) {
      Alert.alert(
        'Download Failed',
        err instanceof Error ? err.message : 'An unknown error occurred.',
      );
    } finally {
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(meta.id);
        return next;
      });
    }
  }, [downloading]);

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderDeck = useCallback(
    ({ item }: { item: DeckMetadata }) => {
      const isDownloading = downloading.has(item.id);
      const levelColor = item.level ? LEVEL_COLORS[item.level.toUpperCase()] ?? colors.primary : undefined;

      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.name}
              </Text>
              {item.level && (
                <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
                  <Text style={styles.levelText}>{item.level.toUpperCase()}</Text>
                </View>
              )}
            </View>
            {item.description ? (
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <Text style={styles.cardMeta}>
              {item.cardCount} {item.cardCount === 1 ? 'card' : 'cards'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.downloadButton, isDownloading && styles.downloadButtonDisabled]}
            onPress={() => handleDownload(item)}
            disabled={isDownloading}
            activeOpacity={0.7}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={20} color={colors.text.inverse} />
                <Text style={styles.downloadButtonText}>Download</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [downloading, colors, styles, handleDownload],
  );

  // ── States ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading online decks…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.text.tertiary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => load()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        renderItem={renderDeck}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No online decks available right now.</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: sizes.spacing.xxl,
    },
    list: {
      padding: sizes.spacing.md,
    },
    loadingText: {
      marginTop: sizes.spacing.md,
      fontSize: sizes.fontSize.md,
      color: colors.text.secondary,
    },
    errorText: {
      marginTop: sizes.spacing.md,
      fontSize: sizes.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: sizes.fontSize.md * 1.5,
    },
    retryButton: {
      marginTop: sizes.spacing.lg,
      paddingHorizontal: sizes.spacing.xl,
      paddingVertical: sizes.spacing.sm + 2,
      borderRadius: sizes.radius.lg,
      backgroundColor: colors.primary,
    },
    retryButtonText: {
      color: colors.text.inverse,
      fontSize: sizes.fontSize.md,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: sizes.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    // ── Card ────────────────────────────────
    card: {
      backgroundColor: colors.surface,
      borderRadius: sizes.radius.xl,
      padding: sizes.spacing.lg,
      marginBottom: sizes.spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      marginBottom: sizes.spacing.md,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: sizes.spacing.xs,
    },
    cardName: {
      flex: 1,
      fontSize: sizes.fontSize.lg,
      fontWeight: '700',
      color: colors.text.primary,
    },
    levelBadge: {
      paddingHorizontal: sizes.spacing.sm + 2,
      paddingVertical: 2,
      borderRadius: sizes.radius.sm,
      marginLeft: sizes.spacing.sm,
    },
    levelText: {
      fontSize: sizes.fontSize.xs,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    cardDescription: {
      fontSize: sizes.fontSize.sm,
      color: colors.text.secondary,
      lineHeight: sizes.fontSize.sm * 1.5,
      marginBottom: sizes.spacing.xs,
    },
    cardMeta: {
      fontSize: sizes.fontSize.xs,
      color: colors.text.tertiary,
    },
    // ── Download button ─────────────────────
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: sizes.spacing.sm + 2,
      borderRadius: sizes.radius.lg,
      gap: sizes.spacing.xs,
    },
    downloadButtonDisabled: {
      opacity: 0.6,
    },
    downloadButtonText: {
      fontSize: sizes.fontSize.md,
      fontWeight: '600',
      color: colors.text.inverse,
    },
  });
