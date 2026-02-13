/**
 * Grammar rules – modals (can, could, must, should, may, might).
 */
import type { GrammarRule } from '@/types/grammar';

export const modalsRules: GrammarRule[] = [
  // ── Can / Could ────────────────────────────────
  {
    id: 'modals_can_could',
    categoryId: 'modals',
    title: 'Can / Could',
    shortDescription: 'Express ability, possibility, and polite requests.',
    usageExplanation:
      '"Can" is used for present ability, permission, and informal requests. "Could" is the past form of "can" (past ability) and is also used for polite requests and possibilities. After "can/could", the verb stays in its base form. Negative: "cannot" (can\'t) / "could not" (couldn\'t).',
    structure:
      '+ I/you/he/she/it/we/they can + base verb\n+ I/you/he/she/it/we/they could + base verb\n- Subject + can\'t / couldn\'t + base verb\n? Can / Could + subject + base verb …?',
    examples: [
      { sentence: 'I can swim.', highlight: 'can swim' },
      { sentence: 'She could read when she was four.', highlight: 'could read' },
      { sentence: 'Can you help me?', highlight: 'Can … help' },
      { sentence: 'Could you open the window, please?', highlight: 'Could … open' },
      { sentence: 'He can\'t drive.', highlight: 'can\'t drive' },
    ],
    commonMistakes: [
      {
        incorrect: 'She can to swim.',
        correct: 'She can swim.',
        explanation: 'Do not use "to" after "can". Use the base form directly.',
      },
      {
        incorrect: 'He cans play guitar.',
        correct: 'He can play guitar.',
        explanation: '"Can" does not change for third-person singular — no -s.',
      },
    ],
  },

  // ── Must / Have to ─────────────────────────────
  {
    id: 'modals_must_have_to',
    categoryId: 'modals',
    title: 'Must / Have to',
    shortDescription: 'Express obligation and necessity.',
    usageExplanation:
      '"Must" expresses strong obligation or personal conviction. "Have to" expresses external obligation or necessity. In the negative, "mustn\'t" means prohibition (you are not allowed), while "don\'t have to" means there is no obligation (it\'s optional). "Must" has no past form — use "had to" instead.',
    structure:
      '+ Subject + must + base verb\n+ Subject + have to / has to + base verb\n- Subject + mustn\'t + base verb (prohibition)\n- Subject + don\'t / doesn\'t have to + base verb (no obligation)\n? Do/Does + subject + have to + base verb …?',
    examples: [
      { sentence: 'You must wear a seatbelt.', highlight: 'must wear' },
      { sentence: 'I have to finish this report today.', highlight: 'have to finish' },
      { sentence: 'You mustn\'t smoke here.', highlight: 'mustn\'t smoke', translation: 'Interdiction' },
      { sentence: 'You don\'t have to come if you\'re busy.', highlight: 'don\'t have to come', translation: 'Ce n\'est pas obligatoire' },
      { sentence: 'She had to work late yesterday.', highlight: 'had to work' },
    ],
    commonMistakes: [
      {
        incorrect: 'She musts go now.',
        correct: 'She must go now.',
        explanation: '"Must" never changes — no -s for third person.',
      },
      {
        incorrect: 'You don\'t must run.',
        correct: 'You mustn\'t run. / You don\'t have to run.',
        explanation: '"Must" forms its negative as "mustn\'t". "Don\'t" is used with "have to".',
      },
    ],
  },

  // ── Should / Shouldn't ─────────────────────────
  {
    id: 'modals_should',
    categoryId: 'modals',
    title: 'Should / Shouldn\'t',
    shortDescription: 'Give advice and recommendations.',
    usageExplanation:
      '"Should" is used to give advice, make recommendations, or express what is the right thing to do. "Shouldn\'t" is the negative form. The verb after "should" stays in its base form.',
    structure:
      '+ Subject + should + base verb\n- Subject + shouldn\'t + base verb\n? Should + subject + base verb …?',
    examples: [
      { sentence: 'You should eat more vegetables.', highlight: 'should eat' },
      { sentence: 'She shouldn\'t stay up so late.', highlight: 'shouldn\'t stay' },
      { sentence: 'Should I call a doctor?', highlight: 'Should … call' },
      { sentence: 'They should study harder for the exam.', highlight: 'should study' },
    ],
    commonMistakes: [
      {
        incorrect: 'You should to eat more vegetables.',
        correct: 'You should eat more vegetables.',
        explanation: 'Do not use "to" after "should". Use the base form directly.',
      },
    ],
  },

  // ── May / Might ────────────────────────────────
  {
    id: 'modals_may_might',
    categoryId: 'modals',
    title: 'May / Might',
    shortDescription: 'Express possibility and ask for permission.',
    usageExplanation:
      '"May" and "might" express possibility. "May" is slightly more certain than "might". "May" is also used for formal permission. In the negative: "may not" (no contraction in formal English) and "might not" (mightn\'t is rare).',
    structure:
      '+ Subject + may / might + base verb\n- Subject + may not / might not + base verb\n? May + I / we + base verb …? (permission)',
    examples: [
      { sentence: 'It may rain tomorrow.', highlight: 'may rain', translation: 'Assez probable' },
      { sentence: 'She might come to the party.', highlight: 'might come', translation: 'Moins certain' },
      { sentence: 'May I sit here?', highlight: 'May … sit', translation: 'Permission formelle' },
      { sentence: 'He might not agree with you.', highlight: 'might not agree' },
    ],
    commonMistakes: [
      {
        incorrect: 'She mights come.',
        correct: 'She might come.',
        explanation: '"Might" never changes — no -s for third person.',
      },
      {
        incorrect: 'It may to rain.',
        correct: 'It may rain.',
        explanation: 'No "to" after modal verbs.',
      },
    ],
  },
];
