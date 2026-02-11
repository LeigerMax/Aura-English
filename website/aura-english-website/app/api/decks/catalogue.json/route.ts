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
    id: "it-computer-science",
    name: "IT & Computer Science",
    description:
      "Essential vocabulary for software development, networking, cybersecurity and computer science.",
    level: "B1",
    cardCount: 100,
    file: "decks/it-computer-science.json",
  },
  // ──────────────────────────────────────────────────────
  // Add more decks here — just follow the same structure:
  //
  // {
  //   id: "business-english",
  //   name: "Business English",
  //   description: "Key terms for meetings, emails and negotiations.",
  //   level: "B2",
  //   cardCount: 80,
  //   file: "decks/business-english.json",
  // },
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
