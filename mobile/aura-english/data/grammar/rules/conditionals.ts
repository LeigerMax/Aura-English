/**
 * Grammar rules – conditionals (zero, first, second).
 */
import type { GrammarRule } from '@/types/grammar';

export const conditionalsRules: GrammarRule[] = [
  // ── Zero Conditional ───────────────────────────
  {
    id: 'zero_conditional',
    categoryId: 'conditionals',
    title: 'Zero Conditional',
    shortDescription: 'General truths and scientific facts.',
    usageExplanation:
      'The Zero Conditional is used for things that are always true — general facts, scientific truths, and things that always happen under certain conditions. Both clauses use the Present Simple.',
    structure:
      '+ If + subject + present simple, subject + present simple\nThe "if" clause and main clause can be swapped.\nYou can replace "if" with "when" for habitual actions.',
    examples: [
      { sentence: 'If you heat water to 100°C, it boils.', highlight: 'heat … boils' },
      { sentence: 'If it rains, the grass gets wet.', highlight: 'rains … gets' },
      { sentence: 'Plants die if they don\'t get water.', highlight: 'die … don\'t get' },
      { sentence: 'When I feel tired, I drink coffee.', highlight: 'feel … drink' },
    ],
    commonMistakes: [
      {
        incorrect: 'If you will heat water, it boils.',
        correct: 'If you heat water, it boils.',
        explanation: 'Don\'t use "will" in the if-clause of a Zero Conditional.',
      },
    ],
  },

  // ── First Conditional ──────────────────────────
  {
    id: 'first_conditional',
    categoryId: 'conditionals',
    title: 'First Conditional',
    shortDescription: 'Real and possible future situations.',
    usageExplanation:
      'The First Conditional talks about real/possible situations in the future. The if-clause uses the Present Simple; the main clause uses "will" + base verb. It is used for predictions, promises, warnings, and likely outcomes.',
    structure:
      '+ If + subject + present simple, subject + will + base verb\n- If + subject + present simple, subject + won\'t + base verb\n? What will + subject + do if + present simple …?',
    examples: [
      { sentence: 'If it rains, I will take an umbrella.', highlight: 'rains … will take' },
      { sentence: 'If you study hard, you will pass the exam.', highlight: 'study … will pass' },
      { sentence: 'If she doesn\'t hurry, she will miss the bus.', highlight: 'doesn\'t hurry … will miss' },
      { sentence: 'I won\'t go if it rains.', highlight: 'won\'t go … rains' },
    ],
    commonMistakes: [
      {
        incorrect: 'If it will rain, I will take an umbrella.',
        correct: 'If it rains, I will take an umbrella.',
        explanation: 'Don\'t use "will" in the if-clause. Use the Present Simple.',
      },
      {
        incorrect: 'If you will study, you pass.',
        correct: 'If you study, you will pass.',
        explanation: 'The if-clause uses Present Simple; the main clause uses "will".',
      },
    ],
  },

  // ── Second Conditional ─────────────────────────
  {
    id: 'second_conditional',
    categoryId: 'conditionals',
    title: 'Second Conditional',
    shortDescription: 'Unreal or imaginary present/future situations.',
    usageExplanation:
      'The Second Conditional talks about unreal, imaginary, or unlikely situations in the present or future. The if-clause uses the Past Simple; the main clause uses "would" + base verb. With "to be", use "were" for all subjects (formal) — "If I were you…". It is used for hypothetical situations and giving advice.',
    structure:
      '+ If + subject + past simple, subject + would + base verb\n- If + subject + past simple, subject + wouldn\'t + base verb\n? What would + subject + do if + past simple …?',
    examples: [
      { sentence: 'If I had more money, I would travel the world.', highlight: 'had … would travel' },
      { sentence: 'If she were taller, she would play basketball.', highlight: 'were … would play' },
      { sentence: 'If I were you, I would accept the offer.', highlight: 'were … would accept' },
      { sentence: 'What would you do if you won the lottery?', highlight: 'would … do … won' },
    ],
    commonMistakes: [
      {
        incorrect: 'If I would have money, I would travel.',
        correct: 'If I had money, I would travel.',
        explanation: 'Don\'t use "would" in the if-clause. Use the Past Simple.',
      },
      {
        incorrect: 'If I was you, I would go.',
        correct: 'If I were you, I would go.',
        explanation: 'Formally, use "were" (not "was") with all subjects in the Second Conditional.',
      },
    ],
  },
];
