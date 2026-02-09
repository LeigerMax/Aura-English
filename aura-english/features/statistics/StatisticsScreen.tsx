import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/features/home/HomeScreen';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import { sizes } from '@/constants';
import {
  getAllStatistics,
  sortDeckStats,
  type StatisticsData,
  type DeckStats,
  type DeckSortKey,
} from '@/core/services/statisticsService';
import {
  ProgressRing,
  CategoryBar,
  CategoryLegend,
  StatCard,
  CATEGORY_COLORS,
} from '@/components/statistics';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type StatisticsScreenProps = NativeStackScreenProps<RootStackParamList, 'Statistics'>;

const SORT_OPTIONS: { key: DeckSortKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'progress_desc', label: 'Best progress', icon: 'arrow-down' },
  { key: 'progress_asc', label: 'Least progress', icon: 'arrow-up' },
  { key: 'name_asc', label: 'Name A → Z', icon: 'text' },
  { key: 'name_desc', label: 'Name Z → A', icon: 'text' },
];

// ──────────────────────────────────────────────
// Screen
// ──────────────────────────────────────────────

export const StatisticsScreen: React.FC<StatisticsScreenProps> = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey, setSortKey] = useState<DeckSortKey>('progress_desc');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // ── Data fetching ──
  const load = useCallback(async () => {
    try {
      const stats = await getAllStatistics();
      setData(stats);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  // Sorted deck list
  const sortedDecks = useMemo<DeckStats[]>(() => {
    if (!data) return [];
    return sortDeckStats(data.decks, sortKey);
  }, [data, sortKey]);

  // ── Loading state ──
  if (loading && !data) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // ── Empty state ──
  if (!data || data.global.counts.total === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No cards yet</Text>
        <Text style={styles.emptySubtitle}>
          Add flashcards to your decks to start tracking your progress.
        </Text>
      </SafeAreaView>
    );
  }

  const { global } = data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* ── Global Overview Card ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Progress</Text>

        <View style={styles.overviewCard}>
          {/* Top: Total + progress bar */}
          <View style={styles.overviewHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalLabel}>Total Cards</Text>
              <Text style={styles.totalValue}>{global.counts.total}</Text>
            </View>
            <ProgressRing progress={global.progress} size={88} strokeWidth={8} />
          </View>

          {/* Category bar */}
          <View style={{ marginTop: sizes.spacing.md }}>
            <CategoryBar counts={global.counts} height={10} />
          </View>

          {/* Legend */}
          <View style={{ marginTop: sizes.spacing.md }}>
            <CategoryLegend counts={global.counts} />
          </View>
        </View>

        {/* Quick stat grid — 2×2 */}
        <View style={styles.statGrid}>
          <View style={styles.statGridRow}>
            <StatCard
              label="Mastered"
              value={global.counts.mastered}
              color={CATEGORY_COLORS.mastered}
            />
            <View style={{ width: sizes.spacing.sm }} />
            <StatCard
              label="Learning"
              value={global.counts.learning}
              color={CATEGORY_COLORS.learning}
            />
          </View>
          <View style={{ height: sizes.spacing.sm }} />
          <View style={styles.statGridRow}>
            <StatCard
              label="To Review"
              value={global.counts.toReview}
              color={CATEGORY_COLORS.toReview}
            />
            <View style={{ width: sizes.spacing.sm }} />
            <StatCard
              label="Unseen"
              value={global.counts.unseen}
              color={CATEGORY_COLORS.unseen}
            />
          </View>
        </View>
      </View>

      {/* ── Per-Deck Breakdown ── */}
      {sortedDecks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.deckHeader}>
            <Text style={styles.sectionTitle}>Per Deck</Text>

            {/* Sort button */}
            <TouchableOpacity
              onPress={() => setSortMenuOpen(!sortMenuOpen)}
              style={styles.sortButton}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical" size={18} color={colors.primary} />
              <Text style={styles.sortLabel}>Sort</Text>
            </TouchableOpacity>
          </View>

          {/* Sort options (collapsible) */}
          {sortMenuOpen && (
            <View style={styles.sortMenu}>
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortKey === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => {
                      setSortKey(opt.key);
                      setSortMenuOpen(false);
                    }}
                    style={[styles.sortOption, isActive && styles.sortOptionActive]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={16}
                      color={isActive ? colors.primary : colors.text.secondary}
                    />
                    <Text
                      style={[
                        styles.sortOptionLabel,
                        isActive && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Deck cards */}
          {sortedDecks.map((ds) => (
            <DeckStatCard key={ds.deck.id} deckStats={ds} colors={colors} />
          ))}
        </View>
      )}

      <View style={{ height: sizes.spacing.xxl }} />
    </ScrollView>
  );
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function getProgressColor(progress: number, colors: ThemeColors): string {
  if (progress >= 80) return CATEGORY_COLORS.mastered;
  if (progress >= 40) return CATEGORY_COLORS.learning;
  return colors.text.secondary;
}

// ──────────────────────────────────────────────
// DeckStatCard (internal)
// ──────────────────────────────────────────────

const DeckStatCard: React.FC<{ deckStats: DeckStats; colors: ThemeColors }> = ({
  deckStats,
  colors,
}) => {
  const { deck, counts, progress } = deckStats;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: sizes.radius.xl,
        padding: sizes.spacing.md,
        marginBottom: sizes.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: deck.color,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: sizes.spacing.sm }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: sizes.radius.md,
            backgroundColor: deck.color + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: sizes.spacing.sm,
          }}
        >
          <Ionicons name="albums" size={18} color={deck.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: sizes.fontSize.md,
              fontWeight: '700',
              color: colors.text.primary,
            }}
            numberOfLines={1}
          >
            {deck.name}
          </Text>
          <Text style={{ fontSize: sizes.fontSize.xs, color: colors.text.secondary }}>
            {counts.total} card{counts.total === 1 ? '' : 's'}
          </Text>
        </View>
        <Text
          style={{
            fontSize: sizes.fontSize.lg,
            fontWeight: '800',
            color: getProgressColor(progress, colors),
          }}
        >
          {progress}%
        </Text>
      </View>

      {/* Bar */}
      <CategoryBar counts={counts} />

      {/* Mini legend */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: sizes.spacing.sm,
        }}
      >
        <MiniStat label="Mastered" value={counts.mastered} color={CATEGORY_COLORS.mastered} textColor={colors.text.secondary} />
        <MiniStat label="Learning" value={counts.learning} color={CATEGORY_COLORS.learning} textColor={colors.text.secondary} />
        <MiniStat label="Review" value={counts.toReview} color={CATEGORY_COLORS.toReview} textColor={colors.text.secondary} />
        <MiniStat label="Unseen" value={counts.unseen} color={CATEGORY_COLORS.unseen} textColor={colors.text.secondary} />
      </View>
    </View>
  );
};

const MiniStat: React.FC<{ label: string; value: number; color: string; textColor: string }> = ({
  label,
  value,
  color,
  textColor,
}) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: sizes.fontSize.md, fontWeight: '700', color }}>{value}</Text>
    <Text style={{ fontSize: 10, color: textColor }}>{label}</Text>
  </View>
);

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: sizes.spacing.lg,
      paddingTop: sizes.spacing.md,
    },
    centered: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: sizes.spacing.xl,
    },
    emptyIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: sizes.spacing.md,
    },
    emptyTitle: {
      fontSize: sizes.fontSize.xl,
      fontWeight: '700',
      color: colors.text.primary,
      marginTop: sizes.spacing.sm,
    },
    emptySubtitle: {
      fontSize: sizes.fontSize.sm,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: sizes.spacing.sm,
      lineHeight: 20,
    },

    // Section
    section: {
      marginBottom: sizes.spacing.lg,
    },
    sectionTitle: {
      fontSize: sizes.fontSize.xl,
      fontWeight: '800',
      color: colors.text.primary,
      marginBottom: sizes.spacing.md,
    },

    // Overview
    overviewCard: {
      backgroundColor: colors.surface,
      borderRadius: sizes.radius.xl,
      padding: sizes.spacing.lg,
      marginBottom: sizes.spacing.md,
    },
    overviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: sizes.fontSize.sm,
      color: colors.text.secondary,
    },
    totalValue: {
      fontSize: 40,
      fontWeight: '800',
      color: colors.text.primary,
      lineHeight: 48,
    },

    // Stat grid — 2×2
    statGrid: {
      marginTop: sizes.spacing.xs,
    },
    statGridRow: {
      flexDirection: 'row',
    },

    // Deck header
    deckHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: sizes.spacing.sm,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: sizes.spacing.md,
      paddingVertical: sizes.spacing.sm,
      borderRadius: sizes.radius.full,
      backgroundColor: colors.surfaceLight,
    },
    sortLabel: {
      fontSize: sizes.fontSize.sm,
      color: colors.primary,
      marginLeft: 4,
      fontWeight: '600',
    },

    // Sort menu
    sortMenu: {
      backgroundColor: colors.surface,
      borderRadius: sizes.radius.xl,
      padding: sizes.spacing.sm,
      marginBottom: sizes.spacing.md,
    },
    sortOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: sizes.spacing.sm,
      paddingHorizontal: sizes.spacing.md,
      borderRadius: sizes.radius.lg,
    },
    sortOptionActive: {
      backgroundColor: colors.surfaceLight,
    },
    sortOptionLabel: {
      fontSize: sizes.fontSize.sm,
      color: colors.text.secondary,
      marginLeft: sizes.spacing.sm,
    },
  });
