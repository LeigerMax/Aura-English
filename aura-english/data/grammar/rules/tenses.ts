/**
 * Grammar rules – tenses.
 */
import type { GrammarRule } from '@/types/grammar';

export const tensesRules: GrammarRule[] = [
  // ── Present Simple ─────────────────────────────
  {
    id: 'present_simple',
    categoryId: 'tenses',
    title: 'Present Simple',
    shortDescription: 'Used for habits, routines, and general truths.',
    usageExplanation:
      'The Present Simple is used to talk about things that happen regularly, habits, general facts, and permanent situations. For third-person singular (he/she/it), add -s or -es to the base verb.',
    structure: 'Subject + base verb (+ s/es for he/she/it)',
    examples: [
      { sentence: 'I drink coffee every morning.', highlight: 'drink' },
      { sentence: 'She works at a hospital.', highlight: 'works' },
      { sentence: 'The sun rises in the east.', highlight: 'rises' },
      { sentence: 'They do not like spicy food.', highlight: 'do not like' },
    ],
    commonMistakes: [
      {
        incorrect: 'She work at a hospital.',
        correct: 'She works at a hospital.',
        explanation: 'Third-person singular requires -s on the verb.',
      },
      {
        incorrect: 'He don\'t like coffee.',
        correct: 'He doesn\'t like coffee.',
        explanation: 'Use "doesn\'t" (does not) for third-person singular negatives.',
      },
    ],
  },

  // ── Present Continuous ─────────────────────────
  {
    id: 'present_continuous',
    categoryId: 'tenses',
    title: 'Present Continuous',
    shortDescription: 'Used for actions happening right now or around now.',
    usageExplanation:
      'The Present Continuous describes actions that are happening at the moment of speaking, temporary situations, or future arrangements. It is formed with the verb "to be" + verb-ing.',
    structure: 'Subject + am/is/are + verb-ing',
    examples: [
      { sentence: 'I am reading a book right now.', highlight: 'am reading' },
      { sentence: 'She is studying for her exam.', highlight: 'is studying' },
      { sentence: 'They are playing football.', highlight: 'are playing' },
      { sentence: 'We are meeting them tomorrow.', highlight: 'are meeting' },
    ],
    commonMistakes: [
      {
        incorrect: 'I reading a book.',
        correct: 'I am reading a book.',
        explanation: 'The auxiliary verb "am/is/are" is required.',
      },
      {
        incorrect: 'She is know the answer.',
        correct: 'She knows the answer.',
        explanation: '"Know" is a state verb and is rarely used in the continuous form.',
      },
    ],
  },

  // ── Past Simple ────────────────────────────────
  {
    id: 'past_simple',
    categoryId: 'tenses',
    title: 'Past Simple',
    shortDescription: 'Used for completed actions in the past.',
    usageExplanation:
      'The Past Simple is used to talk about finished actions at a specific time in the past. Regular verbs add -ed; irregular verbs have unique past forms (e.g. go → went).',
    structure: 'Subject + past form of verb',
    examples: [
      { sentence: 'I visited Paris last year.', highlight: 'visited' },
      { sentence: 'She went to the store yesterday.', highlight: 'went' },
      { sentence: 'They did not watch the movie.', highlight: 'did not watch' },
      { sentence: 'Did you finish your homework?', highlight: 'Did … finish' },
    ],
    commonMistakes: [
      {
        incorrect: 'I goed to the park.',
        correct: 'I went to the park.',
        explanation: '"Go" is an irregular verb; its past form is "went".',
      },
      {
        incorrect: 'She didn\'t went home.',
        correct: 'She didn\'t go home.',
        explanation: 'After "didn\'t", use the base form of the verb.',
      },
    ],
  },

  // ── Future with will ──────────────────────────
  {
    id: 'future_will',
    categoryId: 'tenses',
    title: 'Future (will)',
    shortDescription: 'Used for predictions, promises, and spontaneous decisions.',
    usageExplanation:
      '"Will" is used for predictions, promises, offers, and decisions made at the moment of speaking. The verb after "will" stays in its base form.',
    structure: 'Subject + will + base verb',
    examples: [
      { sentence: 'I will help you with that.', highlight: 'will help' },
      { sentence: 'It will rain tomorrow.', highlight: 'will rain' },
      { sentence: 'They will not forget this.', highlight: 'will not forget' },
      { sentence: 'Will you come to the party?', highlight: 'Will … come' },
    ],
    commonMistakes: [
      {
        incorrect: 'I will to go home.',
        correct: 'I will go home.',
        explanation: 'Do not use "to" between "will" and the base verb.',
      },
    ],
  },

  // ── Future with going to ──────────────────────
  {
    id: 'future_going_to',
    categoryId: 'tenses',
    title: 'Future (going to)',
    shortDescription: 'Used for plans and intentions.',
    usageExplanation:
      '"Going to" is used for future plans, intentions, and predictions based on evidence. It is formed with "am/is/are + going to + base verb".',
    structure: 'Subject + am/is/are + going to + base verb',
    examples: [
      { sentence: 'I am going to travel next month.', highlight: 'am going to travel' },
      { sentence: 'She is going to start a new job.', highlight: 'is going to start' },
      { sentence: 'Look at those clouds — it is going to rain.', highlight: 'is going to rain' },
    ],
    commonMistakes: [
      {
        incorrect: 'I going to travel.',
        correct: 'I am going to travel.',
        explanation: 'The auxiliary "am/is/are" is required before "going to".',
      },
    ],
  },

  // ── Past Continuous ────────────────────────────
  {
    id: 'past_continuous',
    categoryId: 'tenses',
    title: 'Past Continuous',
    shortDescription: 'Used for actions that were in progress at a specific moment in the past.',
    usageExplanation:
      'The Past Continuous describes actions that were happening at a particular time in the past, or background actions interrupted by another event. It is formed with "was/were" + verb-ing.',
    structure: 'Subject + was/were + verb-ing',
    examples: [
      { sentence: 'I was watching TV when she called.', highlight: 'was watching' },
      { sentence: 'They were playing outside at 5 PM.', highlight: 'were playing' },
      { sentence: 'She was reading while he was cooking.', highlight: 'was reading … was cooking' },
      { sentence: 'We were not listening to the teacher.', highlight: 'were not listening' },
    ],
    commonMistakes: [
      {
        incorrect: 'I was watch TV.',
        correct: 'I was watching TV.',
        explanation: 'After "was/were", the verb must be in the -ing form.',
      },
      {
        incorrect: 'They was playing football.',
        correct: 'They were playing football.',
        explanation: 'Use "were" with plural subjects (they, we, you).',
      },
    ],
  },

  // ── Present Perfect Simple ─────────────────────
  {
    id: 'present_perfect_simple',
    categoryId: 'tenses',
    title: 'Present Perfect Simple',
    shortDescription: 'Used for past actions connected to the present.',
    usageExplanation:
      'The Present Perfect connects the past to the present. It is used for experiences (ever/never), recent actions (just), unfinished time periods (today, this week), and results visible now. It is formed with "have/has" + past participle.',
    structure: 'Subject + have/has + past participle',
    examples: [
      { sentence: 'I have visited London three times.', highlight: 'have visited' },
      { sentence: 'She has just finished her homework.', highlight: 'has just finished' },
      { sentence: 'They have never tried sushi.', highlight: 'have never tried' },
      { sentence: 'Have you ever been to Japan?', highlight: 'Have … been' },
    ],
    commonMistakes: [
      {
        incorrect: 'I have went to Paris.',
        correct: 'I have gone to Paris.',
        explanation: 'Use the past participle ("gone"), not the past simple ("went").',
      },
      {
        incorrect: 'She has eat lunch already.',
        correct: 'She has eaten lunch already.',
        explanation: '"Eat" is irregular: eat → ate → eaten. Use the past participle after "has".',
      },
      {
        incorrect: 'I have seen him yesterday.',
        correct: 'I saw him yesterday.',
        explanation: 'Do not use the Present Perfect with a finished time expression (yesterday). Use the Past Simple instead.',
      },
    ],
  },
];
