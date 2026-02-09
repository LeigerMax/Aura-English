import type { Feature, Step } from "@/src/types";

export const FEATURES: Feature[] = [
  {
    title: "Decks & Flashcards",
    description:
      "Build and organize your own card decks. Flip, learn, repeat — at your own pace.",
    icon: "📚",
  },
  {
    title: "Smart Revision",
    description:
      "Spaced repetition powered by SM-2 ensures you review cards right before you forget them.",
    icon: "🧠",
  },
  {
    title: "Quizzes & Challenges",
    description:
      "Test your knowledge with interactive quizzes and daily challenges to stay sharp.",
    icon: "🎯",
  },
  {
    title: "Offline-First",
    description:
      "Everything runs locally on your device. No internet required — learn anywhere, anytime.",
    icon: "📶",
  },
];

export const STEPS: Step[] = [
  {
    number: 1,
    title: "Learn",
    description: "Browse curated decks and discover new vocabulary and grammar rules.",
  },
  {
    number: 2,
    title: "Practice",
    description: "Use flashcards, quizzes and challenges to reinforce what you learned.",
  },
  {
    number: 3,
    title: "Master",
    description: "Smart revision schedules ensure long-term retention of every concept.",
  },
];
