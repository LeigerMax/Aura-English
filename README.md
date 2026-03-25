<p align="center">
  <img src="mobile/aura-english/assets/logo.png" alt="Aura English Logo" width="120" />
</p>

<h1 align="center">Aura English</h1>

<p align="center">
  A modern, AI-powered English learning app with interactive flashcards and spaced repetition.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.4.2-blue" alt="Version" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-61dafb" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-54-000020" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Platform-Android-3ddc84" alt="Platform" />
</p>

---

## ✨ Features

- 📇 **Interactive Flashcards** — Flip-animated cards with word, definition, and example sentence
- 🧠 **Spaced Repetition (SM-2)** — Smart review scheduling to maximize retention
- 🤖 **AI Card Generation** — Generate flashcards using Google Gemini API
- 📚 **20+ Built-in Decks** — Curated vocabulary from CEFR levels A1 through C2
- 🌐 **Online Deck Repository** — Browse and download community decks
- 📤 **Import / Export** — Share decks via JSON files or QR codes
- 🎯 **Quiz Mode** — Test your knowledge with interactive quizzes
- ⚡ **Daily Challenges** — Keep your streak alive with daily exercises
- 📖 **Grammar Reference** — Categorized grammar rules and explanations
- 📊 **Statistics Dashboard** — Track your progress with detailed metrics
- 🎨 **Themes** — Light, Dark, and unlockable Aurora theme
- 🔔 **Smart Notifications** — Configurable study reminders
- 🔄 **OTA Updates** — Seamless over-the-air updates via Expo Updates

## 🏗️ Project Structure

This is a **monorepo** containing two projects:

```
Aura-English/
├── mobile/aura-english/    # React Native (Expo) mobile application
│   ├── features/           # Feature modules
│   │   ├── home/           # Home screen
│   │   ├── decks/          # Deck management & online decks
│   │   ├── flashcards/     # Flashcard CRUD
│   │   ├── quiz/           # Quiz mode
│   │   ├── review/         # Spaced repetition review
│   │   ├── challenge/      # Daily challenges
│   │   ├── grammar/        # Grammar reference
│   │   ├── statistics/     # Progress tracking
│   │   └── settings/       # App settings & API key config
│   ├── components/ui/      # Reusable UI components
│   ├── core/
│   │   ├── database/       # SQLite schema & migrations
│   │   ├── engine/         # SM-2 algorithm, quiz engine, card classifier
│   │   ├── services/       # Business logic services
│   │   └── theme/          # Theme system (Light / Dark / Aurora)
│   ├── data/
│   │   ├── defaultDecks/   # Built-in CEFR A1–C2 vocabulary decks
│   │   ├── grammar/        # Grammar rules data
│   │   └── repositories/   # Data access layer (Repository pattern)
│   ├── constants/          # Colors, sizes, config
│   └── types/              # TypeScript type definitions
│
└── website/aura-english-website/   # Next.js marketing website
```

## 🛠️ Tech Stack

### Mobile App

| Category       | Technology                                        |
| -------------- | ------------------------------------------------- |
| **Framework**  | React Native 0.81 + Expo 54                       |
| **Language**   | TypeScript 5.9                                    |
| **Navigation** | React Navigation (Native Stack)                   |
| **Styling**    | NativeWind (Tailwind CSS for RN)                  |
| **Database**   | Expo SQLite (local, offline-first)                |
| **AI**         | Google Gemini API (user-provided key)             |
| **Animations** | React Native Reanimated                           |
| **Security**   | Expo Secure Store (API key storage)               |
| **Updates**    | Expo Updates (OTA) + Native APK update checker    |
| **Testing**    | Jest + React Native Testing Library               |

### Website

| Category       | Technology       |
| -------------- | ---------------- |
| **Framework**  | Next.js          |
| **Language**   | TypeScript       |
| **Styling**    | Tailwind CSS     |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android device or emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/LeigerMax/Aura-English.git
cd Aura-English/mobile/aura-english

# Install dependencies
npm install

# Start the development server
npx expo start
```

Then press `a` to open on an **Android** device/emulator.

### Website

```bash
cd website/aura-english-website
npm install
npm run dev
```

## 🧩 Architecture

The mobile app follows a **feature-first architecture** with a clean separation of concerns:

- **Features** — Self-contained screen modules (each feature owns its screens and local logic)
- **Core** — Shared infrastructure: database layer, SRS engine (SM-2 algorithm), services, and theming
- **Data** — Repository pattern for data access, built-in deck content, and grammar data
- **Components** — Reusable UI building blocks (FlashcardCard, DeckCard, QRShareModal, etc.)

### Key Services

| Service                | Responsibility                                    |
| ---------------------- | ------------------------------------------------- |
| `geminiService`        | AI-powered flashcard generation via Gemini API    |
| `reviewService`        | Spaced repetition scheduling (SM-2)               |
| `challengeService`     | Daily challenge logic                             |
| `remoteDeckService`    | Online deck browsing and download                 |
| `qrDeckService`        | QR code deck sharing                              |
| `importService`        | Deck import from JSON files                       |
| `exportService`        | Deck export to JSON files                         |
| `notificationService`  | Study reminder notifications                      |
| `statisticsService`    | Progress tracking and metrics                     |
| `updateService`        | OTA and native APK update checking                |
| `soundService`         | Audio feedback                                    |

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**LeigerMax** — [GitHub](https://github.com/LeigerMax)

---

<p align="center"><b>Made with ❤️ and ☕ in 2026</b></p>
