import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import type { Flashcard } from '@/types/models';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/core/theme';

export interface FlashcardCardProps {
  /**
   * Flashcard data to display
   */
  flashcard: Flashcard;
  
  /**
   * Callback when card is pressed
   */
  onPress?: (flashcard: Flashcard) => void;
  
  /**
   * Callback when edit is pressed
   */
  onEdit?: (flashcard: Flashcard) => void;
  
  /**
   * Callback when delete is pressed
   */
  onDelete?: (flashcard: Flashcard) => void;
  
  /**
   * Whether the card is disabled
   */
  disabled?: boolean;
  
  /**
   * Show as quiz card (no actions)
   */
  isQuizMode?: boolean;
}


/**
 * FlashcardCard - Modern flippable card component with beautiful animations
 * 
 * Features:
 * - Smooth flip animation
 * - Modern gradient design
 * - Touch to flip or reveal
 * - Accessibility support
 */
export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  flashcard,
  onPress,
  onEdit,
  onDelete,
  disabled = false,
  isQuizMode = false,
}) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  const flipAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const { isDark } = useTheme();

  const handleFlip = () => {
    if (disabled) return;

    const toValue = isFlipped ? 0 : 1;
    
    Animated.spring(flipAnim, {
      toValue,
      useNativeDriver: true,
      speed: 12,
      bounciness: 8,
    }).start();

    setIsFlipped(!isFlipped);
    
    if (onPress) {
      onPress(flashcard);
    }
  };

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        speed: 50,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }).start();
    }
  };

  // Interpolate rotation
  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View 
      className="mb-5 mx-4"
      style={{ 
        transform: [{ scale: scaleAnim }],
        minHeight: 280,
      }}
    >
      <Pressable
        onPress={handleFlip}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Flashcard: ${flashcard.word}`}
        accessibilityHint="Tap to flip"
        className="relative"
        style={{ minHeight: 280 }}
      >
        {/* Front side (Word) */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backfaceVisibility: 'hidden',
              transform: [{ rotateY: frontRotateY }],
              opacity: frontOpacity,
            },
          ]}
          pointerEvents={isFlipped ? 'none' : 'auto'}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg"
        >
          <View className="flex-1 items-center justify-center p-8">
            <View className="bg-primary-100 dark:bg-primary-900 px-4 py-2 rounded-full mb-4">
              <Text className="text-primary-600 dark:text-primary-300 font-semibold text-xs uppercase tracking-wide">
                ENGLISH
              </Text>
            </View>
            
            <Text className="text-4xl font-bold text-gray-900 dark:text-gray-50 text-center mb-8">
              {flashcard.word}
            </Text>
            
            <View className="flex-row items-center opacity-60">
              <Ionicons name="sync-outline" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                Tap to flip
              </Text>
            </View>
          </View>

          {/* Action buttons - Front */}
          {!isQuizMode && (onEdit || onDelete) && (
            <View className="absolute top-4 right-4 flex-row gap-2">
              {onEdit && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onEdit(flashcard);
                  }}
                  className="bg-white dark:bg-gray-700 rounded-full p-2 shadow-sm"
                  style={{ elevation: 2 }}
                >
                  <Ionicons name="pencil" size={18} color="#5B5FE5" />
                </TouchableOpacity>
              )}
              
              {onDelete && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(flashcard);
                  }}
                  className="bg-white dark:bg-gray-700 rounded-full p-2 shadow-sm"
                  style={{ elevation: 2 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>

        {/* Back side (Definition + Example) */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backfaceVisibility: 'hidden',
              transform: [{ rotateY: backRotateY }],
              opacity: backOpacity,
            },
          ]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
          className="rounded-3xl overflow-hidden shadow-lg"
        >
          <LinearGradient
            colors={['#5B5FE5', '#4A4FD4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 p-6"
          >
            <View className="flex-1 justify-center">
              <View className="bg-white/10 px-3 py-1.5 rounded-full self-start mb-4">
                <Text className="text-white font-semibold text-xs uppercase tracking-wide">
                  DÉFINITION
                </Text>
              </View>
              
              <Text className="text-white text-xl font-medium leading-7 mb-6">
                {flashcard.definition}
              </Text>
              
              {flashcard.context && (
                <View className="mt-4 pt-4 border-t border-white/20">
                  <View className="bg-white/10 px-3 py-1.5 rounded-full self-start mb-3">
                    <Text className="text-white font-semibold text-xs uppercase tracking-wide">
                      EXAMPLE
                    </Text>
                  </View>
                  <Text className="text-white/90 text-base italic leading-6">
                    "{flashcard.context}"
                  </Text>
                </View>
              )}
            </View>
            
            <View className="flex-row items-center justify-center mt-4 opacity-80">
              <Ionicons name="sync-outline" size={16} color="white" />
              <Text className="text-white text-sm ml-2">
                Flip back
              </Text>
            </View>
          </LinearGradient>

          {/* Action buttons - Back */}
          {!isQuizMode && (onEdit || onDelete) && (
            <View className="absolute top-4 right-4 flex-row gap-2">
              {onEdit && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onEdit(flashcard);
                  }}
                  className="bg-white dark:bg-gray-700 rounded-full p-2 shadow-sm"
                  style={{ elevation: 2 }}
                >
                  <Ionicons name="pencil" size={18} color="#5B5FE5" />
                </TouchableOpacity>
              )}
              
              {onDelete && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete(flashcard);
                  }}
                  className="bg-white dark:bg-gray-700 rounded-full p-2 shadow-sm"
                  style={{ elevation: 2 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};
