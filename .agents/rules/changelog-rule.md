---
trigger: always_on
---

# AI Rule: Changelog Maintenance

You are responsible for maintaining the project's changelog files.

### 📋 Requirements
- **Mandatory Update**: After every significant modification, feature addition, or bug fix, you MUST update the following files:
  1. `f:\Projets\Aura-English\changelog.md` (Root)
  2. `f:\Projets\Aura-English\website\aura-english-website\src\data\changelog.ts` (Website Data)
- **Current Version**: Always ensure the version numbers match across `app.json`, `package.json`, and the changelogs.
- **Format**:
  - Use [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format for the `.md` file.
  - Keep the `.ts` file entries concise for UI display.
- **Timing**: Perform the update as the final step of your implementation before notifying the user.

### 🛠️ Process
1. If a tasks involves a version bump, reflect it in both files.
2. Group changes by: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
3. Use today's date in `YYYY-MM-DD` format.
