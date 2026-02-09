import type { Feature, Step, Screenshot } from "@/src/types";
import {
  BookOpen,
  Brain,
  Target,
  WifiOff,
  Sparkles,
  GraduationCap,
} from "lucide-react";

export const FEATURES: Feature[] = [
  {
    title: "Decks & Flashcards",
    description:
      "Build and organize your own card decks. Flip, learn, repeat — at your own pace.",
    icon: BookOpen,
    gradient: "from-blue-500 to-cyan-400",
    iconColor: "text-blue-600",
  },
  {
    title: "Smart Revision",
    description:
      "Spaced repetition powered by SM-2 ensures you review cards right before you forget them.",
    icon: Brain,
    gradient: "from-violet-500 to-purple-400",
    iconColor: "text-violet-600",
  },
  {
    title: "Quizzes & Challenges",
    description:
      "Test your knowledge with interactive quizzes and daily challenges to stay sharp.",
    icon: Target,
    gradient: "from-orange-500 to-amber-400",
    iconColor: "text-orange-600",
  },
  {
    title: "Offline-First",
    description:
      "Everything runs locally on your device. No internet required — learn anywhere, anytime.",
    icon: WifiOff,
    gradient: "from-emerald-500 to-teal-400",
    iconColor: "text-emerald-600",
  },
  {
    title: "AI-Powered Hints",
    description:
      "Connect your own AI provider (Gemini, etc.) to get smart hints, explanations and personalized help.",
    icon: Sparkles,
    gradient: "from-pink-500 to-rose-400",
    iconColor: "text-pink-600",
  },
  {
    title: "Grammar Lessons",
    description:
      "Interactive grammar exercises covering A1 to C2 levels with detailed rules and explanations.",
    icon: GraduationCap,
    gradient: "from-indigo-500 to-blue-400",
    iconColor: "text-indigo-600",
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

export const SCREENSHOTS: Screenshot[] = [
  {
    src: "/screenshots/home.png",
    alt: "Aura English Home Screen",
    label: "Home",
  },
  {
    src: "/screenshots/flashcard.png",
    alt: "Flashcard Review",
    label: "Flashcards",
  },
  {
    src: "/screenshots/quiz.png",
    alt: "Quiz Mode",
    label: "Quiz",
  },
  {
    src: "/screenshots/grammar.png",
    alt: "Grammar Lessons",
    label: "Grammar",
  },
];
