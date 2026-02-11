export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

/**
 * Changelog data — update this list each time you publish a new APK.
 * The first entry should always be the latest version.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.4.0",
    date: "2026-02-11",
    changes: [
      "Export decks to an app-compatible file.",
      "Import decks from a file",
      "Official Decks section available on the website",
      "Direct deck download from the app",
      "Share decks between users",
      "Bug fixes and performance improvements",
    ],
  },
];
