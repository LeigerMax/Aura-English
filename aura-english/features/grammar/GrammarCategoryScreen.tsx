/**
 * GrammarCategoryScreen – lists all rules inside a chosen category.
 */
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, sizes } from '@/constants';
import { getCategoryById, getRulesForCategory, getExercisesForRule } from '@/data/grammar';
import type { RootStackParamList } from '@/features/home/HomeScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'GrammarCategory'>;

export const GrammarCategoryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { categoryId } = route.params;
  const category = getCategoryById(categoryId);
  const rules = getRulesForCategory(categoryId);

  if (!category) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Category not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category header */}
        <View style={[styles.categoryHeader, { backgroundColor: category.color + '12' }]}>
          <Ionicons name={category.iconName as any} size={32} color={category.color} />
          <Text style={[styles.categoryTitle, { color: category.color }]}>{category.title}</Text>
          <Text style={styles.categoryDesc}>{category.description}</Text>
        </View>

        {/* Rules list */}
        {rules.map((rule, index) => {
          const exerciseCount = getExercisesForRule(rule.id).length;
          return (
            <TouchableOpacity
              key={rule.id}
              style={styles.ruleCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('GrammarRule', { ruleId: rule.id })}
            >
              <View style={styles.ruleIndex}>
                <Text style={styles.ruleIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.ruleBody}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleShort}>{rule.shortDescription}</Text>
                {exerciseCount > 0 && (
                  <View style={styles.badge}>
                    <Ionicons name="fitness-outline" size={12} color={colors.primary} />
                    <Text style={styles.badgeText}>
                      {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: sizes.spacing.lg, paddingBottom: sizes.spacing.xxxl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: sizes.fontSize.md, color: colors.text.secondary },
  categoryHeader: {
    alignItems: 'center',
    borderRadius: sizes.radius.xl,
    padding: sizes.spacing.lg,
    marginBottom: sizes.spacing.lg,
  },
  categoryTitle: { fontSize: sizes.fontSize.xl, fontWeight: '800', marginTop: sizes.spacing.sm },
  categoryDesc: { fontSize: sizes.fontSize.sm, color: colors.text.secondary, marginTop: 4 },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: sizes.radius.xl,
    padding: sizes.spacing.md,
    marginBottom: sizes.spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  ruleIndex: {
    width: 36,
    height: 36,
    borderRadius: sizes.radius.full,
    backgroundColor: colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sizes.spacing.md,
  },
  ruleIndexText: { fontSize: sizes.fontSize.sm, fontWeight: '700', color: colors.primary },
  ruleBody: { flex: 1 },
  ruleTitle: { fontSize: sizes.fontSize.md, fontWeight: '700', color: colors.text.primary },
  ruleShort: { fontSize: sizes.fontSize.sm, color: colors.text.secondary, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  badgeText: { fontSize: sizes.fontSize.xs, color: colors.primary, fontWeight: '600' },
});
