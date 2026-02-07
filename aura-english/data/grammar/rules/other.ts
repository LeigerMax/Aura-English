/**
 * Grammar rules – sentence structure, articles, prepositions, pronouns, adjectives & adverbs.
 */
import type { GrammarRule } from '@/types/grammar';

// ── Sentence Structure ─────────────────────────
export const sentenceStructureRules: GrammarRule[] = [
  {
    id: 'affirmative_negative_question',
    categoryId: 'sentence_structure',
    title: 'Affirmative / Negative / Question',
    shortDescription: 'How to form the three main sentence types.',
    usageExplanation:
      'English sentences follow a Subject-Verb-Object (SVO) order. Negatives add "not" (or a contracted form) after the auxiliary verb. Questions invert the subject and auxiliary.',
    structure:
      'Affirmative: S + V + O\nNegative: S + aux + not + V + O\nQuestion: Aux + S + V + O?',
    examples: [
      { sentence: 'She likes music.', highlight: 'likes' },
      { sentence: 'She does not like music.', highlight: 'does not like' },
      { sentence: 'Does she like music?', highlight: 'Does … like' },
    ],
    commonMistakes: [
      {
        incorrect: 'Does she likes music?',
        correct: 'Does she like music?',
        explanation: 'After "does", use the base form of the verb (no -s).',
      },
    ],
  },
  {
    id: 'was_were_did',
    categoryId: 'sentence_structure',
    title: 'Was / Wasn\'t / Were / Weren\'t / Did / Didn\'t',
    shortDescription: 'Past auxiliaries for questions and negatives.',
    usageExplanation:
      '"Was" and "were" are the past forms of "to be". "Was" is used with I/he/she/it; "were" is used with you/we/they. "Did" is the past auxiliary for all other verbs in questions and negatives; the main verb stays in its base form after "did/didn\'t".',
    structure:
      'Was/Were + subject …? (to be)\nDid + subject + base verb …? (other verbs)\nSubject + wasn\'t/weren\'t …\nSubject + didn\'t + base verb …',
    examples: [
      { sentence: 'She was tired yesterday.', highlight: 'was' },
      { sentence: 'They were not at home.', highlight: 'were not' },
      { sentence: 'Was he at the meeting?', highlight: 'Was' },
      { sentence: 'We weren\'t ready.', highlight: 'weren\'t' },
      { sentence: 'Did you see the movie?', highlight: 'Did … see' },
      { sentence: 'I didn\'t understand the question.', highlight: 'didn\'t understand' },
    ],
    commonMistakes: [
      {
        incorrect: 'Did you was there?',
        correct: 'Were you there?',
        explanation: 'For "to be", use "was/were" directly — do not add "did".',
      },
      {
        incorrect: 'She didn\'t went home.',
        correct: 'She didn\'t go home.',
        explanation: 'After "didn\'t", use the base form of the verb, not the past form.',
      },
      {
        incorrect: 'I were happy.',
        correct: 'I was happy.',
        explanation: 'Use "was" with first-person singular (I) and third-person singular (he/she/it).',
      },
    ],
  },
];

// ── Articles ───────────────────────────────────
export const articlesRules: GrammarRule[] = [
  {
    id: 'articles_a_an_the',
    categoryId: 'articles',
    title: 'A / An / The',
    shortDescription: 'When to use indefinite and definite articles.',
    usageExplanation:
      '"A" is used before consonant sounds, "an" before vowel sounds. Both are indefinite articles for non-specific nouns. "The" is the definite article, used when the noun is specific or already mentioned.',
    structure: 'a + consonant sound | an + vowel sound | the + specific noun',
    examples: [
      { sentence: 'I saw a cat in the garden.', highlight: 'a cat' },
      { sentence: 'She ate an apple.', highlight: 'an apple' },
      { sentence: 'The book on the table is mine.', highlight: 'The book' },
      { sentence: 'He is a university student.', highlight: 'a university', translation: '"university" starts with a /j/ consonant sound' },
    ],
    commonMistakes: [
      {
        incorrect: 'She is a honest person.',
        correct: 'She is an honest person.',
        explanation: '"Honest" starts with a vowel sound (/ɒ/), so use "an".',
      },
    ],
  },
];

// ── Prepositions ───────────────────────────────
export const prepositionsRules: GrammarRule[] = [
  {
    id: 'prepositions_place',
    categoryId: 'prepositions',
    title: 'Prepositions of Place',
    shortDescription: 'In, on, at for locations.',
    usageExplanation:
      '"In" is used for enclosed spaces (in a room, in a city). "On" is for surfaces (on a table, on a wall). "At" is for specific points or addresses (at the door, at 5 Main St).',
    structure: 'in (enclosed) / on (surface) / at (point)',
    examples: [
      { sentence: 'The keys are in the drawer.', highlight: 'in' },
      { sentence: 'The painting is on the wall.', highlight: 'on' },
      { sentence: 'She is waiting at the bus stop.', highlight: 'at' },
    ],
    commonMistakes: [
      {
        incorrect: 'I live at Paris.',
        correct: 'I live in Paris.',
        explanation: 'Use "in" for cities and countries, not "at".',
      },
    ],
  },
  {
    id: 'prepositions_time',
    categoryId: 'prepositions',
    title: 'Prepositions of Time',
    shortDescription: 'In, on, at for time expressions.',
    usageExplanation:
      '"At" is for precise times (at 5 PM, at noon). "On" is for days and dates (on Monday, on July 4th). "In" is for longer periods (in January, in 2024, in the morning).',
    structure: 'at (time) / on (day/date) / in (month/year/period)',
    examples: [
      { sentence: 'The meeting is at 3 PM.', highlight: 'at' },
      { sentence: 'I was born on March 15th.', highlight: 'on' },
      { sentence: 'We go on holiday in August.', highlight: 'in' },
    ],
    commonMistakes: [
      {
        incorrect: 'See you in Monday.',
        correct: 'See you on Monday.',
        explanation: 'Use "on" for specific days of the week.',
      },
    ],
  },
];

// ── Pronouns ───────────────────────────────────
export const pronounsRules: GrammarRule[] = [
  {
    id: 'subject_pronouns',
    categoryId: 'pronouns',
    title: 'Subject Pronouns',
    shortDescription: 'I, you, he, she, it, we, they.',
    usageExplanation:
      'Subject pronouns replace the subject of a sentence. They perform the action of the verb: I, you, he, she, it, we, they.',
    structure: 'Subject pronoun + verb + …',
    examples: [
      { sentence: 'She speaks French fluently.', highlight: 'She' },
      { sentence: 'They are coming to dinner.', highlight: 'They' },
      { sentence: 'We love this city.', highlight: 'We' },
    ],
  },
  {
    id: 'object_pronouns',
    categoryId: 'pronouns',
    title: 'Object Pronouns',
    shortDescription: 'Me, you, him, her, it, us, them.',
    usageExplanation:
      'Object pronouns receive the action of the verb or follow a preposition: me, you, him, her, it, us, them.',
    structure: '… + verb + object pronoun',
    examples: [
      { sentence: 'Can you help me?', highlight: 'me' },
      { sentence: 'I called her yesterday.', highlight: 'her' },
      { sentence: 'The teacher told them to sit down.', highlight: 'them' },
    ],
    commonMistakes: [
      {
        incorrect: 'She told I to wait.',
        correct: 'She told me to wait.',
        explanation: 'After a verb, use the object pronoun "me", not "I".',
      },
    ],
  },
];

// ── Adjectives & Adverbs ───────────────────────
export const adjectivesAdverbsRules: GrammarRule[] = [
  {
    id: 'adjectives_order',
    categoryId: 'adjectives_adverbs',
    title: 'Adjective Order',
    shortDescription: 'The natural order of multiple adjectives.',
    usageExplanation:
      'When using multiple adjectives, English follows a conventional order: Opinion → Size → Age → Shape → Colour → Origin → Material → Purpose. You rarely need all categories, but keeping the order makes sentences sound natural.',
    structure: 'Opinion – Size – Age – Shape – Colour – Origin – Material – Purpose + noun',
    examples: [
      { sentence: 'A beautiful small old round brown French wooden writing desk.', highlight: 'beautiful small old round brown French wooden writing' },
      { sentence: 'She wore a lovely long red dress.', highlight: 'lovely long red' },
    ],
  },
  {
    id: 'adverbs_frequency',
    categoryId: 'adjectives_adverbs',
    title: 'Adverbs of Frequency',
    shortDescription: 'Always, usually, often, sometimes, never…',
    usageExplanation:
      'Adverbs of frequency tell how often something happens. They normally go before the main verb but after the verb "to be".',
    structure: 'Subject + adverb + main verb  |  Subject + be + adverb',
    examples: [
      { sentence: 'I always brush my teeth before bed.', highlight: 'always' },
      { sentence: 'She is usually on time.', highlight: 'usually' },
      { sentence: 'They never eat fast food.', highlight: 'never' },
    ],
    commonMistakes: [
      {
        incorrect: 'I go always to the gym.',
        correct: 'I always go to the gym.',
        explanation: 'Place the adverb of frequency before the main verb.',
      },
    ],
  },
];

// ── Connectors (Both, So, Either, Neither) ─────
export const connectorsRules: GrammarRule[] = [
  {
    id: 'both_either_neither',
    categoryId: 'connectors',
    title: 'Both, Either, Neither',
    shortDescription: 'Talking about two things or people.',
    usageExplanation:
      '"Both" means the two together (positive). "Either" means one or the other (positive choice or negative context). "Neither" means not one and not the other (negative). "Both … and" pairs two affirmative ideas. "Either … or" offers a choice. "Neither … nor" negates both options.',
    structure:
      'Both + plural noun / Both … and …\nEither + singular noun / Either … or …\nNeither + singular noun / Neither … nor …',
    examples: [
      { sentence: 'Both students passed the exam.', highlight: 'Both' },
      { sentence: 'Both Tom and Sarah speak French.', highlight: 'Both … and' },
      { sentence: 'You can have either tea or coffee.', highlight: 'either … or' },
      { sentence: 'Neither answer is correct.', highlight: 'Neither' },
      { sentence: 'Neither the teacher nor the students were ready.', highlight: 'Neither … nor' },
    ],
    commonMistakes: [
      {
        incorrect: 'Both students doesn\'t agree.',
        correct: 'Both students don\'t agree.',
        explanation: '"Both" takes a plural verb (don\'t, not doesn\'t).',
      },
      {
        incorrect: 'Neither of them are coming.',
        correct: 'Neither of them is coming.',
        explanation: '"Neither" is grammatically singular, so it takes a singular verb ("is").',
      },
    ],
  },
  {
    id: 'so_too_neither_either_responses',
    categoryId: 'connectors',
    title: 'So / Neither (agreement)',
    shortDescription: 'Agreeing with "So do I" / "Neither do I".',
    usageExplanation:
      '"So" is used to agree with a positive statement: "So do I", "So am I", "So has she". "Neither" (or "nor") is used to agree with a negative statement: "Neither do I", "Neither can he". "Too" goes at the end of a positive agreement ("I do too") and "either" at the end of a negative one ("I don\'t either").',
    structure:
      'Positive agreement: So + auxiliary + subject / Subject + auxiliary + too\nNegative agreement: Neither + auxiliary + subject / Subject + auxiliary + not + either',
    examples: [
      { sentence: '"I like pizza." — "So do I."', highlight: 'So do I' },
      { sentence: '"She has been to Rome." — "So have I."', highlight: 'So have I' },
      { sentence: '"I don\'t like spiders." — "Neither do I."', highlight: 'Neither do I' },
      { sentence: '"He can\'t swim." — "Neither can she."', highlight: 'Neither can she' },
      { sentence: '"I love chocolate." — "I do too."', highlight: 'too' },
      { sentence: '"I don\'t eat meat." — "I don\'t either."', highlight: 'either' },
    ],
    commonMistakes: [
      {
        incorrect: '"I like pizza." — "Neither do I."',
        correct: '"I like pizza." — "So do I."',
        explanation: 'Use "So" to agree with a positive statement, not "Neither".',
      },
      {
        incorrect: '"I don\'t like spiders." — "So don\'t I."',
        correct: '"I don\'t like spiders." — "Neither do I."',
        explanation: 'Use "Neither" to agree with a negative statement.',
      },
    ],
  },
];
