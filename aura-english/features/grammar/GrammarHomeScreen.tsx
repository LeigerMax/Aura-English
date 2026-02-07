/**
 * GrammarHomeScreen – lists all grammar categories with their rule counts.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import { sizes } from '@/constants';
import { allCategories, getRulesForCategory } from '@/data/grammar';
import type { RootStackParamList } from '@/features/home/HomeScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'Grammar'>;

export const GrammarHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>📖</Text>
          <Text style={styles.headerTitle}>Grammar</Text>
          <Text style={styles.headerSubtitle}>Learn the rules, practise with exercises</Text>
        </View>

        {/* Category list */}
        {allCategories.map((category) => {
          const ruleCount = getRulesForCategory(category.id).length;
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('GrammarCategory', { categoryId: category.id })}
            >
              <View style={[styles.iconBox, { backgroundColor: category.color + '18' }]}>
                <Ionicons name={category.iconName as any} size={26} color={category.color} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{category.title}</Text>
                <Text style={styles.cardDesc}>{category.description}</Text>
                <Text style={styles.cardMeta}>
                  {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          );
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>More rules coming soon ✨</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: sizes.spacing.lg, paddingBottom: sizes.spacing.xxxl },
  header: { alignItems: 'center', marginBottom: sizes.spacing.xl },
  headerEmoji: { fontSize: 48, marginBottom: sizes.spacing.sm },
  headerTitle: { fontSize: sizes.fontSize.xxl, fontWeight: '800', color: colors.text.primary },
  headerSubtitle: { fontSize: sizes.fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: sizes.radius.xl,
    padding: sizes.spacing.md,
    marginBottom: sizes.spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: sizes.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: sizes.fontSize.md, fontWeight: '700', color: colors.text.primary },
  cardDesc: { fontSize: sizes.fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  cardMeta: { fontSize: sizes.fontSize.xs, color: colors.text.tertiary, marginTop: 4 },
  footer: { alignItems: 'center', marginTop: sizes.spacing.xl },
  footerText: { fontSize: sizes.fontSize.sm, color: colors.text.tertiary },
});
