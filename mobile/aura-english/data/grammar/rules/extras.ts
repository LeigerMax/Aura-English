/**
 * Grammar rules – passive voice & quantifiers.
 */
import type { GrammarRule } from '@/types/grammar';

// ── Passive Voice ──────────────────────────────
export const passiveVoiceRules: GrammarRule[] = [
  {
    id: 'passive_present',
    categoryId: 'passive_voice',
    title: 'Present Simple Passive',
    shortDescription: 'Focus on the action, not who does it.',
    usageExplanation:
      'The passive voice is used when the action is more important than who performs it, or when the doer is unknown. The Present Simple Passive is formed with "am/is/are" + past participle. The agent can be mentioned with "by".',
    structure:
      '+ Subject + am/is/are + past participle (+ by agent)\n- Subject + am/is/are + not + past participle\n? Am/Is/Are + subject + past participle …?',
    examples: [
      { sentence: 'English is spoken all over the world.', highlight: 'is spoken' },
      { sentence: 'The rooms are cleaned every day.', highlight: 'are cleaned' },
      { sentence: 'This car is made in Germany.', highlight: 'is made' },
      { sentence: 'The letters are not delivered on Sundays.', highlight: 'are not delivered' },
      { sentence: 'Is French taught at your school?', highlight: 'Is … taught' },
    ],
    commonMistakes: [
      {
        incorrect: 'English is speak all over the world.',
        correct: 'English is spoken all over the world.',
        explanation: 'Use the past participle (spoken), not the base form (speak).',
      },
      {
        incorrect: 'The rooms is cleaned every day.',
        correct: 'The rooms are cleaned every day.',
        explanation: '"Rooms" is plural, so use "are", not "is".',
      },
    ],
  },
  {
    id: 'passive_past',
    categoryId: 'passive_voice',
    title: 'Past Simple Passive',
    shortDescription: 'Describe past events focusing on the result.',
    usageExplanation:
      'The Past Simple Passive is formed with "was/were" + past participle. It is used to describe completed past actions when the focus is on the action or result, not the doer.',
    structure:
      '+ Subject + was/were + past participle (+ by agent)\n- Subject + was/were + not + past participle\n? Was/Were + subject + past participle …?',
    examples: [
      { sentence: 'The pyramids were built thousands of years ago.', highlight: 'were built' },
      { sentence: 'The window was broken by the children.', highlight: 'was broken' },
      { sentence: 'The emails were sent yesterday.', highlight: 'were sent' },
      { sentence: 'Was the book written by Dickens?', highlight: 'Was … written' },
      { sentence: 'The match wasn\'t cancelled.', highlight: 'wasn\'t cancelled' },
    ],
    commonMistakes: [
      {
        incorrect: 'The letter was wrote yesterday.',
        correct: 'The letter was written yesterday.',
        explanation: 'Use the past participle "written", not the past simple "wrote".',
      },
      {
        incorrect: 'The cakes was made by my mum.',
        correct: 'The cakes were made by my mum.',
        explanation: '"Cakes" is plural → use "were".',
      },
    ],
  },
];

// ── Quantifiers ────────────────────────────────
export const quantifiersRules: GrammarRule[] = [
  {
    id: 'quantifiers_some_any',
    categoryId: 'quantifiers',
    title: 'Some / Any',
    shortDescription: 'Talk about indefinite quantities.',
    usageExplanation:
      '"Some" is used in positive sentences and in offers/requests. "Any" is used in negative sentences and questions. "Some" can also be used in questions when offering or requesting something (Would you like some tea?). With uncountable and plural countable nouns.',
    structure:
      '+ Subject + verb + some + noun (positive)\n- Subject + verb + not … any + noun (negative)\n? Do/Does + subject + verb + any + noun …? (question)\n? Would you like some …? (offer)',
    examples: [
      { sentence: 'I have some friends in London.', highlight: 'some friends' },
      { sentence: 'There is some milk in the fridge.', highlight: 'some milk' },
      { sentence: 'I don\'t have any money.', highlight: 'any money' },
      { sentence: 'Are there any questions?', highlight: 'any questions' },
      { sentence: 'Would you like some coffee?', highlight: 'some coffee', translation: 'Offre → some' },
    ],
    commonMistakes: [
      {
        incorrect: 'I don\'t have some money.',
        correct: 'I don\'t have any money.',
        explanation: 'In negative sentences, use "any", not "some".',
      },
      {
        incorrect: 'Do you have some questions?',
        correct: 'Do you have any questions?',
        explanation: 'In general questions, use "any". Use "some" only for offers/requests.',
      },
    ],
  },
  {
    id: 'quantifiers_much_many',
    categoryId: 'quantifiers',
    title: 'Much / Many / A lot of',
    shortDescription: 'Express large quantities.',
    usageExplanation:
      '"Much" is used with uncountable nouns (much water, much time). "Many" is used with countable nouns (many books, many people). "A lot of" can be used with both types and is more common in positive sentences. "Much" and "many" are mainly used in questions and negatives.',
    structure:
      'much + uncountable noun (questions / negatives)\nmany + countable plural noun (questions / negatives)\na lot of + uncountable or countable noun (positive / all)',
    examples: [
      { sentence: 'There isn\'t much time left.', highlight: 'much time' },
      { sentence: 'How many students are in your class?', highlight: 'many students' },
      { sentence: 'She has a lot of friends.', highlight: 'a lot of friends' },
      { sentence: 'We don\'t have much money.', highlight: 'much money' },
      { sentence: 'There are a lot of books on the shelf.', highlight: 'a lot of books' },
    ],
    commonMistakes: [
      {
        incorrect: 'She has much friends.',
        correct: 'She has many friends. / She has a lot of friends.',
        explanation: '"Friends" is countable — use "many" or "a lot of", not "much".',
      },
      {
        incorrect: 'How many water do you need?',
        correct: 'How much water do you need?',
        explanation: '"Water" is uncountable — use "much", not "many".',
      },
    ],
  },
];
