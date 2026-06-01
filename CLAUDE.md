# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Galactic Quest is an offline-first educational game for grades 1-5 (ages 6-11). It uses React 18 + Vite 5 + Tailwind CSS and stores all game state in browser localStorage with no backend or cloud dependencies.

## Development Commands

```bash
# Development server (hot reload)
npm run dev

# Production build
npm build

# Preview production build locally
npm run preview

# Reset all game data (console command)
localStorage.removeItem('galactic_state'); location.reload();
```

The dev server runs on `http://localhost:5173` by default.

## Grade Level System

Users select their grade level (1st-5th) during registration. Questions are filtered to show only grade-appropriate content:

- **Grade 1**: Basic counting, simple addition/subtraction, colors, shapes, weather, sight words, local geography
- **Grade 2**: Two-digit math, patterns, life cycles, habitats, phonics, context clues, continents
- **Grade 3**: Multiplication, division, geometry, forces/motion, adaptations, comprehension, US regions
- **Grade 4**: Multi-digit operations, factors/multiples, ecosystems, Earth cycles, inference, theme, US states
- **Grade 5**: Decimals, fractions, percentages, Earth systems, matter, analysis, figurative language, world geography

Each grade has 60+ questions (4 subjects × 3 difficulties × 5+ each), aligned to Common Core and NGSS standards.

### Changing Grades

Parents can change a child's grade in Parent Settings (PIN: 1234). This resets subject difficulties and clears answered question pools while preserving XP, coins, and badges.

## Architecture

### State Management Pattern

The app uses a **centralized state + navigation pattern** centered in [App.jsx](src/App.jsx):

- `gameState` — single source of truth for all game data (player, subjects, quests, settings)
- `screen` + `screenParams` — router-like navigation without external libraries
- `updateState(updater)` — functional state updates propagated to all screens
- `navigate(screenName, params)` — screen transition with parameters

All state updates automatically persist to localStorage via a `useEffect` in App.jsx.

### State Structure

Defined in [src/utils/storage.js](src/utils/storage.js):

- `player` — name, avatar, grade (1-5), XP, level, coins, streak, badges, total stats
- `subjects` — per-subject difficulty (1-3), recent answers (for adaptive difficulty), answered questions, total stats
- `dailyQuest` — daily challenge with subject, progress, rewards (grade-aware)
- `sessions` — ring buffer of last 7 quiz sessions
- `settings` — parent PIN, time limits, sound toggle

State is deep-merged on load to handle new keys added in future versions.

### Game Logic Engine

[src/utils/gameLogic.js](src/utils/gameLogic.js) contains all progression systems:

- **XP and Leveling**: Level thresholds defined in `LEVEL_THRESHOLDS` array (100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000 XP)
- **Rewards**: Difficulty-based XP/coins in `DIFF_REWARDS`, plus bonuses for perfect sessions, daily quests, streaks
- **Adaptive Difficulty**: Calculated from last 10 answers per subject (80%+ correct → increase difficulty, 40%− correct → decrease)
- **Badges**: Checked via `checkBadges()` after sessions and state changes
- **Streak System**: Increments on consecutive daily play, resets if a day is skipped
- **Daily Quest**: Auto-generated per day using `generateDailyQuest()`, rotates subjects by day of year

Key functions:
- `processAnswer(state, subject, isCorrect, difficulty)` — handles single answer, updates stats, awards XP/coins, progresses daily quest
- `processSessionEnd(state, subject, correct, total, difficulty)` — called after quiz completion, awards bonuses, logs session, adjusts difficulty, checks badges
- `checkDailyStreak(state)` — called on app init to reset streak if broken and regenerate daily quest if new day
- `recordPlay(state)` — marks today as played, increments streak if consecutive

### Question Bank

[src/data/questions.js](src/data/questions.js) contains 300+ questions across 5 grades × 4 subjects × 3 difficulty levels.

Question format:
```js
{
  id: "g1_m1_1",      // g{grade}_{subject}{difficulty}_{number}
  grade: 1,           // 1-5
  subject: "math",    // "math" | "science" | "reading" | "geography"
  topic: "addition",
  difficulty: 1,      // 1-3 within each grade
  question: "Question text?",
  options: ["A", "B", "C", "D"],
  correct: 0,         // 0-based index
  explanation: "Why this is correct",
  hint: "A small clue",
}
```

Use helper functions:
- `getQuestions(subject, grade, difficulty)` — filter by subject, grade, and difficulty
- `getSessionQuestions(subject, grade, difficulty, count, exclude)` — shuffle and return N questions, excluding already answered
- `getSpeedRoundQuestions(subject, grade, count, exclude)` — mix of all difficulties for timed mode

### Screen Navigation

Six screens defined in `src/screens/`:
- `HomeScreen` — main hub with XP bar, daily quest, streak, navigation to all modes
- `SubjectSelectScreen` — galaxy map showing 4 subject planets
- `QuizScreen` — main quiz mode (10 questions per session)
- `SpeedRoundScreen` — timed 60-second challenge (30 questions max)
- `ShopScreen` — spend coins on avatar unlocks
- `ParentScreen` — PIN-protected progress view

All screens receive `{ gameState, updateState, navigate, ...screenParams }` as props.

### Styling System

Tailwind CSS with custom space theme:
- Space palette: `space-dark`, `space-navy`, `space-blue`, `card-bg`, `card-border`
- Galactic colors: `galactic-purple`, `galactic-blue`, `galactic-green`, `galactic-yellow`, `galactic-red`, `galactic-pink`, `galactic-orange`, `galactic-cyan`
- Starfield background: 80 static stars positioned in [App.jsx](src/App.jsx) with CSS animations

Colors match subject themes defined in `SUBJECT_META` in questions.js.

## Adding Content

### Adding Questions

Edit [src/data/questions.js](src/data/questions.js):
1. Follow the question format schema above
2. Ensure unique `id` (convention: `g{grade}_{subject_initial}{difficulty}_{number}`)
3. Set appropriate `grade` level (1-5) and match subject knowledge to that grade
4. Match `subject` to one of: `math`, `science`, `reading`, `geography`
5. Set appropriate `difficulty` level (1-3) within the grade
6. Write child-appropriate explanations with emoji for positive reinforcement

### Adding Badges

Edit `BADGES` object in [src/utils/gameLogic.js](src/utils/gameLogic.js):
1. Add badge definition with id, label, emoji, description
2. Add check condition in `checkBadges()` function
3. Badge IDs stored in `state.player.badges` array

### Adding Shop Items

Edit `SHOP_ITEMS` array in [src/utils/gameLogic.js](src/utils/gameLogic.js):
- Each item needs: `id`, `type`, `emoji`, `label`, `cost`, `reqLevel`
- Currently only `avatar` type is implemented
- Purchase logic in `buyItem()` handles coin deduction and unlock tracking

## Safety and Content Guidelines

This is a children's educational app:
- **No external APIs** — everything runs offline after initial load
- **No chat or social features**
- **Positive-only feedback** — no negative language or imagery
- **Age-appropriate content** — grades 1-5 (ages 6-11), with grade-specific question filtering
- **Parent controls** — PIN-protected settings and progress view (default PIN: `1234`)

## State Persistence

All game data persists in `localStorage` under key `galactic_state`:
- Auto-saves on every state change
- Deep-merges saved state with `DEFAULT_STATE` on load to handle schema evolution
- Use `resetState()` from storage.js to wipe all data and return to defaults
- No server sync, no cloud backup — purely client-side

## Common Patterns

### Updating Game State

Always use the `updateState` function passed to screens:
```js
// Functional update (preferred)
updateState(prev => ({
  ...prev,
  player: { ...prev.player, coins: prev.player.coins + 10 }
}))

// Direct merge (for simple updates)
updateState({ someKey: newValue })
```

### Processing Quiz Answers

Use the gameLogic functions:
```js
import { processAnswer, processSessionEnd } from '../utils/gameLogic'

// After each answer
const { newState, xpGained, coinsGained } = processAnswer(
  gameState, subject, isCorrect, difficulty
)
updateState(newState)

// After session ends
const { newState, bonusXP, bonusCoins, newBadges } = processSessionEnd(
  gameState, subject, correctCount, totalQuestions, difficulty
)
updateState(newState)
```

### Navigation Between Screens

```js
// Navigate to new screen
navigate('quiz', { subject: 'math' })

// Return to home
navigate('home')

// Access params in screen component
function QuizScreen({ gameState, updateState, navigate, subject }) {
  // subject comes from screenParams
}
```
