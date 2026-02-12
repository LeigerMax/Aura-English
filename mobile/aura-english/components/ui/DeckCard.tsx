import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import type { Deck } from '@/types/models';
import { useTheme } from '@/core/theme';
import { sizes } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '@/core/theme';

export interface DeckCardProps {
  /**
   * Deck data to display
   */
  deck: Deck;
  
  /**
   * Callback when deck is pressed
   */
  onPress: (deck: Deck) => void;
  
  /**
   * Callback when edit is pressed (optional)
   */
  onEdit?: (deck: Deck) => void;
  
  /**
   * Whether the card is disabled
   */
  disabled?: boolean;
}

/**
 * DeckCard - Card component to display deck information
 * 
 * Features:
 * - Custom background color per deck
 * - Card count display
 * - Press animation
 * - Optional edit action
 */
export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  onPress,
  onEdit,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: deck.color },
          disabled && styles.cardDisabled,
        ]}
        onPress={() => onPress(deck)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${deck.name} deck`}
        accessibilityHint={`Contains ${deck.cardCount || 0} cards`}
      >
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={2}>
              {deck.name}
            </Text>
            
            {onEdit && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit(deck);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="pencil" size={18} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            )}
          </View>

          {deck.description && (
            <Text style={styles.description} numberOfLines={2}>
              {deck.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.cardCount}>
              <Text style={styles.cardCountText}>
                {deck.cardCount || 0}
              </Text>
              <Text style={styles.cardCountLabel}>
                {deck.cardCount === 1 ? 'card' : 'cards'}
              </Text>
            </View>
          </View>
        </View>

        {/* Decorative overlay */}
        <View style={styles.overlay} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    marginBottom: sizes.spacing.md,
  },
  card: {
    borderRadius: sizes.radius.xl,
    padding: sizes.spacing.lg,
    minHeight: 140,
    shadowColor: colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  cardDisabled: {
    opacity: 0.6,
  },
  content: {
    position: 'relative',
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizes.spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: sizes.fontSize.xxl,
    fontWeight: '700',
    color: colors.text.inverse,
    lineHeight: sizes.fontSize.xxl * 1.2,
  },
  editButton: {
    padding: sizes.spacing.xs,
    marginLeft: sizes.spacing.sm,
  },
  editIcon: {
    fontSize: sizes.fontSize.lg,
  },
  description: {
    fontSize: sizes.fontSize.sm,
    color: colors.text.inverse,
    opacity: 0.9,
    marginBottom: sizes.spacing.md,
    lineHeight: sizes.fontSize.sm * 1.4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  cardCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardCountText: {
    fontSize: sizes.fontSize.xxxl,
    fontWeight: '800',
    color: colors.text.inverse,
    marginRight: sizes.spacing.xs,
  },
  cardCountLabel: {
    fontSize: sizes.fontSize.md,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 1,
  },
});
