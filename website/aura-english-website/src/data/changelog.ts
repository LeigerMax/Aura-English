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
    version: "1.2.1",
    date: "2026-02-10",
    changes: [
      "Added automatic update notification system",
      "Bug fixes and performance improvements",
    ],
  },
];
