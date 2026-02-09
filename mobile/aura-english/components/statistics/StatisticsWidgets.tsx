import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import { sizes } from '@/constants';
import type { CardCounts } from '@/core/engine/cardClassifier';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

/** Fixed colors for each category — consistent everywhere. */
export const CATEGORY_COLORS = {
  mastered: '#10B981',  // Emerald
  learning: '#3B82F6',  // Blue
  toReview: '#F59E0B',  // Amber
  unseen: '#9CA3AF',    // Gray
} as const;

export const CATEGORY_LABELS = {
  mastered: 'Mastered',
  learning: 'Learning',
  toReview: 'To Review',
  unseen: 'Unseen',
} as const;

// ──────────────────────────────────────────────
// ProgressRing
// ──────────────────────────────────────────────

interface ProgressRingProps {
  /** 0-100 */
  progress: number;
  /** Outer diameter. Default 120. */
  size?: number;
  /** Ring thickness. Default 10. */
  strokeWidth?: number;
}

/**
 * A circular progress indicator drawn with two overlapping Views.
 * Lightweight — no SVG dependency.
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
}) => {
  const { colors } = useTheme();
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors.surfaceLight,
        }}
      />
      {/* Filled arc — approximated with dashed border */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: CATEGORY_COLORS.mastered,
          borderTopColor: clampedProgress >= 25 ? CATEGORY_COLORS.mastered : 'transparent',
          borderRightColor: clampedProgress >= 50 ? CATEGORY_COLORS.mastered : 'transparent',
          borderBottomColor: clampedProgress >= 75 ? CATEGORY_COLORS.mastered : 'transparent',
          borderLeftColor: clampedProgress > 0 ? CATEGORY_COLORS.mastered : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      {/* Center label */}
      <Text style={{ fontSize: size * 0.22, fontWeight: '800', color: colors.text.primary }}>
        {clampedProgress}%
      </Text>
    </View>
  );
};

// ──────────────────────────────────────────────
// CategoryBar
// ──────────────────────────────────────────────

interface CategoryBarProps {
  counts: CardCounts;
  /** Bar height. Default 8. */
  height?: number;
}

/**
 * Horizontal stacked bar showing the proportion of each category.
 */
export const CategoryBar: React.FC<CategoryBarProps> = ({ counts, height = 8 }) => {
  const { colors } = useTheme();

  if (counts.total === 0) {
    return (
      <View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: colors.surfaceLight,
        }}
      />
    );
  }

  const segments: { key: string; value: number; color: string }[] = [
    { key: 'mastered', value: counts.mastered, color: CATEGORY_COLORS.mastered },
    { key: 'learning', value: counts.learning, color: CATEGORY_COLORS.learning },
    { key: 'toReview', value: counts.toReview, color: CATEGORY_COLORS.toReview },
    { key: 'unseen', value: counts.unseen, color: CATEGORY_COLORS.unseen },
  ];

  return (
    <View style={{ flexDirection: 'row', height, borderRadius: height / 2, overflow: 'hidden' }}>
      {segments.map(
        ({ key, value: flex, color }) =>
          flex > 0 && (
            <View
              key={key}
              style={{
                flex,
                backgroundColor: color,
              }}
            />
          ),
      )}
    </View>
  );
};

// ──────────────────────────────────────────────
// CategoryLegend
// ──────────────────────────────────────────────

interface CategoryLegendProps {
  counts: CardCounts;
  /** Show numbers beside labels. Default true. */
  showNumbers?: boolean;
}

/**
 * Vertical legend showing each category with a color dot, label, and count.
 */
export const CategoryLegend: React.FC<CategoryLegendProps> = ({
  counts,
  showNumbers = true,
}) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createLegendStyles(colors), [colors]);

  const items: { label: string; count: number; color: string }[] = [
    { label: CATEGORY_LABELS.mastered, count: counts.mastered, color: CATEGORY_COLORS.mastered },
    { label: CATEGORY_LABELS.learning, count: counts.learning, color: CATEGORY_COLORS.learning },
    { label: CATEGORY_LABELS.toReview, count: counts.toReview, color: CATEGORY_COLORS.toReview },
    { label: CATEGORY_LABELS.unseen, count: counts.unseen, color: CATEGORY_COLORS.unseen },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
          {showNumbers && <Text style={styles.count}>{item.count}</Text>}
        </View>
      ))}
    </View>
  );
};

const createLegendStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    grid: {
      gap: sizes.spacing.xs,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 3,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: sizes.spacing.sm,
    },
    label: {
      fontSize: sizes.fontSize.sm,
      color: colors.text.secondary,
      flex: 1,
    },
    count: {
      fontSize: sizes.fontSize.sm,
      fontWeight: '700',
      color: colors.text.primary,
      minWidth: 28,
      textAlign: 'right',
    },
  });

// ──────────────────────────────────────────────
// StatCard
// ──────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  /** Optional subtitle beneath the value. */
  subtitle?: string;
}

/**
 * Stat badge used in summary grid — auto-sizes for 2-column layout.
 */
export const StatCard: React.FC<StatCardProps> = ({ label, value, color, subtitle }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: sizes.radius.xl,
        paddingVertical: sizes.spacing.md,
        paddingHorizontal: sizes.spacing.sm,
        alignItems: 'center',
        minHeight: 72,
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: sizes.fontSize.xxl,
          fontWeight: '800',
          color: color ?? colors.text.primary,
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: sizes.fontSize.xs,
          color: colors.text.secondary,
          marginTop: 4,
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontSize: sizes.fontSize.xs,
            color: colors.text.tertiary,
            marginTop: 2,
          }}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};
