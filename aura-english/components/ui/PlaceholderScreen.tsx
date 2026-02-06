import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/features/home/HomeScreen';
import { colors, sizes } from '@/constants';

type PlaceholderScreenProps = NativeStackScreenProps<RootStackParamList, any>;

interface PlaceholderProps {
  title: string;
  emoji: string;
  description: string;
}

/**
 * PlaceholderScreen - Temporary screen for modules under development
 */
export const createPlaceholderScreen = ({
  title,
  emoji,
  description,
}: PlaceholderProps) => {
  const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ navigation }) => {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  return PlaceholderScreen;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: sizes.spacing.xl,
  },
  emoji: {
    fontSize: 72,
    marginBottom: sizes.spacing.lg,
  },
  title: {
    fontSize: sizes.fontSize.xxxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: sizes.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: sizes.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: sizes.spacing.xxl,
    lineHeight: sizes.fontSize.lg * 1.5,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: sizes.spacing.xl,
    paddingVertical: sizes.spacing.md,
    borderRadius: sizes.radius.lg,
    shadowColor: colors.shadow,
    shadowOffset: sizes.shadow.offset,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: sizes.shadow.elevation,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: sizes.fontSize.lg,
    fontWeight: '600',
  },
});
