import { NextResponse } from "next/server";

/**
 * Deck metadata for the mobile catalogue.
 * ─────────────────────────────────────────
 * HOW TO ADD A NEW DECK
 * 1. Create an ExportedDeckV1 JSON file in  public/decks/<slug>.json
 *    (see public/decks/it-computer-science.json as a template)
 * 2. Add a new entry to the DECKS array below.
 * 3. Deploy. The mobile app will pick it up on next refresh.
 */

const BASE_URL = "https://aura-english.vercel.app";

interface DeckEntry {
  id: string;
  name: string;
  description: string;
  level?: string;
  cardCount: number;
  /** Path relative to public/ */
  file: string;
}

const DECKS: DeckEntry[] = [
  {
    id: "cefr-a1",
    name: "A1 – Essential Vocabulary",
    description:
      "Beginner: basic words for everyday situations — greetings, numbers, family, food, and common objects.",
    level: "A1",
    cardCount: 384,
    file: "decks/cefr-a1.json",
  },
  {
    id: "cefr-a2",
    name: "A2 – Elementary Vocabulary",
    description:
      "Elementary: expand your range with travel, shopping, routines, and simple descriptions.",
    level: "A2",
    cardCount: 300,
    file: "decks/cefr-a2.json",
  },
  {
    id: "cefr-b1",
    name: "B1 – Intermediate Vocabulary",
    description:
      "Intermediate: express opinions, discuss work, health, and handle most travel situations.",
    level: "B1",
    cardCount: 335,
    file: "decks/cefr-b1.json",
  },
  {
    id: "cefr-b2",
    name: "B2 – Upper-Intermediate Vocabulary",
    description:
      "Upper-intermediate: engage in detailed discussions, understand news, and express nuanced ideas.",
    level: "B2",
    cardCount: 300,
    file: "decks/cefr-b2.json",
  },
  {
    id: "cefr-c1",
    name: "C1 – Advanced Vocabulary",
    description:
      "Advanced: sophisticated language for academic, professional, and complex social contexts.",
    level: "C1",
    cardCount: 232,
    file: "decks/cefr-c1.json",
  },
  {
    id: "cefr-c2",
    name: "C2 – Proficient Vocabulary",
    description:
      "Proficient: master idiomatic expressions, nuanced verbs, and near-native fluency.",
    level: "C2",
    cardCount: 407,
    file: "decks/cefr-c2.json",
  },
  {
    id: "it-computer-science",
    name: "IT & Computer Science",
    description:
      "Essential vocabulary for software development, networking, cybersecurity and computer science.",
    level: "B1",
    cardCount: 100,
    file: "decks/it-computer-science.json",
  },
  {
    id: "gaming",
    name: "Gaming Vocabulary",
    description:
      "Essential English vocabulary for gamers — FPS, MOBA, RPG, streaming and online multiplayer.",
    level: "A2",
    cardCount: 100,
    file: "decks/gaming.json",
  },
  {
    id: "everyday-essentials",
    name: "Everyday Essentials",
    description:
      "Beginner-friendly deck covering greetings, present simple, basic questions and daily vocabulary.",
    level: "A1",
    cardCount: 80,
    file: "decks/everyday-essentials.json",
  },
  {
    id: "small-talk-mastery",
    name: "Small Talk Mastery",
    description:
      "Learn to talk about yourself, ask natural questions, keep conversations going and use everyday expressions.",
    level: "A2",
    cardCount: 70,
    file: "decks/small-talk-mastery.json",
  },
  {
    id: "travel-survival",
    name: "Travel Survival English",
    description:
      "Everything you need at the airport, hotel, restaurant, for directions and in emergencies while travelling.",
    level: "A2",
    cardCount: 80,
    file: "decks/travel-survival.json",
  },
  {
    id: "business-english",
    name: "Business English Basics",
    description:
      "Professional vocabulary for emails, meetings, presentations and the corporate world.",
    level: "B2",
    cardCount: 80,
    file: "decks/business-english.json",
  },
  // ──────────────────────────────────────────────────────
  // Add more decks here — just follow the same structure.
  // ──────────────────────────────────────────────────────
];

/**
 * GET /api/decks/catalogue.json
 *
 * Returns the deck catalogue consumed by the mobile app's
 * Online Decks screen.
 */
export async function GET() {
  const catalogue = {
    version: "1.0" as const,
    updatedAt: new Date().toISOString(),
    decks: DECKS.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      level: d.level,
      cardCount: d.cardCount,
      downloadUrl: `${BASE_URL}/${d.file}`,
    })),
  };

  return NextResponse.json(catalogue, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
