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
    version: "1.4.1",
    date: "2026-02-12",
    changes: [
      "Add delete decks",
      "Add new decks online",
      "Fix name app",
      "Add edit deck",
      "Bug fixes and performance improvements",
    ],
  },
];
