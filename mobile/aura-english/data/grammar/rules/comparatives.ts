/**
 * Grammar rules – comparatives & superlatives.
 */
import type { GrammarRule } from '@/types/grammar';

export const comparativesRules: GrammarRule[] = [
  // ── Comparatives ───────────────────────────────
  {
    id: 'comparatives',
    categoryId: 'comparatives_superlatives',
    title: 'Comparatives',
    shortDescription: 'Compare two things: bigger, more interesting.',
    usageExplanation:
      'Comparatives are used to compare two things. Short adjectives (1 syllable) add "-er" (tall → taller). Adjectives ending in -y change to "-ier" (happy → happier). Long adjectives (2+ syllables) use "more" + adjective (beautiful → more beautiful). Some adjectives are irregular: good → better, bad → worse, far → farther/further.',
    structure:
      '+ Subject + verb + comparative + than + noun/pronoun\nShort adj: adj + -er + than\nLong adj: more + adj + than\nIrregular: good → better, bad → worse, far → farther',
    examples: [
      { sentence: 'She is taller than her brother.', highlight: 'taller than' },
      { sentence: 'This book is more interesting than that one.', highlight: 'more interesting than' },
      { sentence: 'My car is faster than yours.', highlight: 'faster than' },
      { sentence: 'English is easier than Chinese.', highlight: 'easier than' },
      { sentence: 'He is better at maths than me.', highlight: 'better … than' },
    ],
    commonMistakes: [
      {
        incorrect: 'She is more tall than him.',
        correct: 'She is taller than him.',
        explanation: '"Tall" is a short adjective (1 syllable) — use "-er", not "more".',
      },
      {
        incorrect: 'This is gooder than that.',
        correct: 'This is better than that.',
        explanation: '"Good" is irregular: good → better (not "gooder").',
      },
      {
        incorrect: 'He is more happier now.',
        correct: 'He is happier now.',
        explanation: 'Don\'t use "more" and "-er" together. Choose one.',
      },
    ],
  },

  // ── Superlatives ───────────────────────────────
  {
    id: 'superlatives',
    categoryId: 'comparatives_superlatives',
    title: 'Superlatives',
    shortDescription: 'Express the highest degree: the biggest, the most beautiful.',
    usageExplanation:
      'Superlatives compare one thing to all others in a group. Short adjectives add "-est" (tall → the tallest). Long adjectives use "the most" + adjective (beautiful → the most beautiful). Irregular: good → the best, bad → the worst, far → the farthest/furthest. Always use "the" before a superlative.',
    structure:
      '+ Subject + verb + the + superlative (+ in/of …)\nShort adj: the + adj + -est\nLong adj: the most + adj\nIrregular: good → the best, bad → the worst',
    examples: [
      { sentence: 'She is the tallest student in the class.', highlight: 'the tallest' },
      { sentence: 'This is the most beautiful city I\'ve ever seen.', highlight: 'the most beautiful' },
      { sentence: 'He is the best player on the team.', highlight: 'the best' },
      { sentence: 'Monday is the worst day of the week.', highlight: 'the worst' },
    ],
    commonMistakes: [
      {
        incorrect: 'She is tallest in the class.',
        correct: 'She is the tallest in the class.',
        explanation: 'Always use "the" before a superlative adjective.',
      },
      {
        incorrect: 'This is the most good restaurant.',
        correct: 'This is the best restaurant.',
        explanation: '"Good" is irregular: the best (not "the most good").',
      },
    ],
  },
];
