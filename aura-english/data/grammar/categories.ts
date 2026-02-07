/**
 * Grammar categories – defines the top-level grouping shown on the Grammar Home screen.
 */
import type { GrammarCategory } from '@/types/grammar';

export const grammarCategories: GrammarCategory[] = [
  {
    id: 'tenses',
    title: 'Tenses',
    description: 'Learn how to express time in English',
    iconName: 'time-outline',
    color: '#3B82F6',
    ruleIds: ['present_simple', 'present_continuous', 'past_simple', 'past_continuous', 'present_perfect_simple', 'future_will', 'future_going_to'],
  },
  {
    id: 'sentence_structure',
    title: 'Sentence Structure',
    description: 'Build correct sentences',
    iconName: 'list-outline',
    color: '#8B5CF6',
    ruleIds: ['affirmative_negative_question', 'was_were_did'],
  },
  {
    id: 'articles',
    title: 'Articles',
    description: 'A, an & the',
    iconName: 'document-text-outline',
    color: '#EC4899',
    ruleIds: ['articles_a_an_the'],
  },
  {
    id: 'prepositions',
    title: 'Prepositions',
    description: 'In, on, at, by…',
    iconName: 'navigate-outline',
    color: '#F59E0B',
    ruleIds: ['prepositions_place', 'prepositions_time'],
  },
  {
    id: 'pronouns',
    title: 'Pronouns',
    description: 'I, you, he, she, it…',
    iconName: 'people-outline',
    color: '#10B981',
    ruleIds: ['subject_pronouns', 'object_pronouns'],
  },
  {
    id: 'adjectives_adverbs',
    title: 'Adjectives & Adverbs',
    description: 'Describe things and actions',
    iconName: 'color-palette-outline',
    color: '#EF4444',
    ruleIds: ['adjectives_order', 'adverbs_frequency'],
  },
  {
    id: 'connectors',
    title: 'Both, So, Either, Neither',
    description: 'Linking and agreeing with two things',
    iconName: 'git-compare-outline',
    color: '#06B6D4',
    ruleIds: ['both_either_neither', 'so_too_neither_either_responses'],
  },
];
