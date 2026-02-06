# 🎓 LinguaFlash AI - Aura English

Une application moderne d'apprentissage de l'anglais avec flashcards interactives et design 2026.

![Version](https://img.shields.io/badge/version-2.0-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61dafb)
![Expo](https://img.shields.io/badge/Expo-54.0-000020)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)

## ✨ Caractéristiques

- 📇 **Flashcards interactives** - Cartes retournables avec animations fluides
- 🎨 **Design moderne 2026** - Interface élégante avec gradients et ombres
- 🤖 **UI préparée pour l'IA** - Interface prête pour suggestions automatiques
- 📱 **Responsive** - Adapté à toutes les tailles d'écran
- 💾 **Base de données locale** - SQLite pour stockage hors ligne
- 🎯 **Organisation par decks** - Classez vos cartes par thème
- 📊 **Suivi de progression** - Statistiques et métriques de révision
- 🌙 **Prêt pour le mode sombre** - Architecture supportant les thèmes

## 🚀 Installation rapide

```bash
# Cloner le projet
git clone [your-repo-url]
cd aura-english

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

Puis appuyez sur :
- `a` pour Android
- `i` pour iOS
- `w` pour Web

## 📱 Captures d'écran

### Page d'accueil moderne
- Logo et branding élégant
- Carte de progression avec gradient
- Grille de modules avec icônes colorées

### Formulaire de création
- Interface propre et intuitive
- Bouton AI pour suggestions
- Aperçu en temps réel de la carte

### Cartes flashcards
- Face avant : Mot avec badge "ANGLAIS"
- Face arrière : Définition et exemple sur gradient violet/bleu
- Animations de flip fluides

## 🛠️ Technologies

### Core
- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **TypeScript** - Type safety

### UI/UX
- **NativeWind** - Tailwind CSS pour React Native
- **Expo Linear Gradient** - Gradients natifs
- **Ionicons** - Icônes vectorielles
- **React Navigation** - Navigation

### Data
- **Expo SQLite** - Base de données locale
- **Custom Repository Pattern** - Architecture propre

## 📚 Documentation

- [📖 Guide de démarrage rapide](QUICKSTART.md)
- [🎨 Guide des composants](COMPONENTS_GUIDE.md)
- [✨ Notes de modernisation](MODERNIZATION.md)

## 🏗️ Structure du projet

```
aura-english/
├── components/
│   └── ui/              # Composants UI réutilisables
│       ├── FlashcardCard.tsx    # Carte flashcard moderne
│       ├── ModernButton.tsx     # Bouton polyvalent
│       └── InfoCard.tsx         # Carte d'information
├── features/
│   ├── home/            # Écran d'accueil
│   ├── decks/           # Gestion des decks
│   ├── flashcards/      # CRUD flashcards
│   ├── quiz/            # Mode quiz
│   ├── challenge/       # Défis quotidiens
│   └── grammar/         # Règles de grammaire
├── core/
│   ├── database/        # SQLite + Schema
│   └── storage/         # Persistance
├── data/
│   └── repositories/    # Couche d'accès aux données
├── constants/           # Couleurs, tailles, etc.
├── types/              # Types TypeScript
└── utils/              # Fonctions utilitaires
```

## 🎨 Composants UI modernes

### FlashcardCard
Carte flashcard interactive avec animation de retournement
```tsx
<FlashcardCard
  flashcard={flashcard}
  onPress={handleFlip}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### ModernButton
Bouton avec variantes et gradients
```tsx
<ModernButton
  title="Créer"
  variant="primary"
  icon="add"
  onPress={handleCreate}
/>
```

### InfoCard
Carte d'information élégante
```tsx
<InfoCard
  title="Progression"
  description="Cette semaine"
  value="85%"
  variant="gradient"
/>
```

## 🎯 Fonctionnalités principales

### ✅ Gestion des flashcards
- Créer, éditer, supprimer des cartes
- Ajouter définitions et exemples
- Organiser par decks thématiques

### 📚 Système de decks
- Créer des decks personnalisés
- Associer plusieurs decks à une carte
- Couleurs personnalisables

### 🎓 Modes d'apprentissage
- **Quiz** - Testez vos connaissances
- **Challenge** - Défis quotidiens
- **Grammar** - Règles de grammaire
- **Révision espacée** - Algorithme SRS

## 🔮 Prochaines fonctionnalités

- [ ] Intégration API OpenAI pour suggestions
- [ ] Mode sombre complet
- [ ] Synchronisation cloud
- [ ] Partage de decks communautaires
- [ ] Statistiques avancées avec graphiques
- [ ] Notifications de révision
- [ ] Mode hors ligne complet
- [ ] Export/Import de decks

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

**Aura English Team**

## 🙏 Remerciements

- Design inspiré par les meilleures pratiques UI/UX 2026
- Communauté Expo et React Native
- Tous les contributeurs

---

**Made with ❤️ and ☕ in 2026**

