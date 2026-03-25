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
    version: "1.4.2",
    date: "2026-03-25",
    changes: [
      "Add 11 new vocabulary decks (total 490+ cards)",
      "Update app version to 1.4.2",
      "Specialized decks: Finance, AI, Psychology",
      "Automatic changelog system implementation",
      "Fix repeating notifications by scheduling 7 days of unique words",
      "Added Privacy Policy and Terms of Use pages",
      "Improved Statistics Progress Ring with 1% granularity",
      "Added SEO optimization: meta tags, sitemap, robots.txt, and Google Site Verification",
    ],
  },
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
