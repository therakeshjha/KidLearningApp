# Grade Level Selection System - Design Specification

**Date:** 2026-06-01  
**Status:** Approved  
**Target:** Galactic Quest Educational Game

## Overview

Add grade level selection (1st-5th grade) during user registration to filter content and provide age-appropriate, curriculum-aligned questions for each grade level. Each grade will have its own comprehensive question bank aligned to Common Core and NGSS standards.

## Goals

1. Allow users to select their grade level (1st, 2nd, 3rd, 4th, or 5th grade) during sign-in
2. Filter questions to show only grade-appropriate content
3. Provide comprehensive, curriculum-aligned question banks for all 5 grades
4. Maintain existing difficulty progression (1-3) within each grade level
5. Enable grade changes through parent-protected settings

## User Experience Flow

### New User Registration Flow

1. User enters username on WelcomeScreen (existing)
2. **NEW:** User proceeds to GradeSelectScreen
3. User selects their grade level from 5 visual options (1st-5th)
4. System creates profile with grade stored in `player.grade`
5. User enters home screen with grade-filtered content

### Existing User Migration Flow

1. Existing user logs in
2. System detects `player.grade === null`
3. Redirect to GradeSelectScreen with message: "Welcome back! Please select your grade level to continue."
4. User selects grade (one-time)
5. Proceeds to home screen

### Grade Change Flow (Parent Settings)

1. Parent accesses Parent Settings (PIN-protected)
2. Finds "Change Grade Level" option
3. Selects new grade from dropdown
4. System shows confirmation dialog: "Changing grade will reset progress and difficulties. Continue?"
5. On confirm: grade updated, subject difficulties reset to 1, answered questions pool cleared
6. User returns to game with new grade-appropriate content

## Data Model

### State Changes

#### storage.js - DEFAULT_STATE.player
```javascript
player: {
  name: 'Commander Galactic',
  avatar: '🚀',
  theme: 'space',
  grade: null,  // NEW: 1, 2, 3, 4, or 5 (null for legacy users requiring migration)
  level: 1,
  xp: 0,
  coins: 50,
  streak: 0,
  lastPlayedDate: null,
  totalAnswered: 0,
  totalCorrect: 0,
  badges: [],
  unlockedAvatars: ['🚀'],
  unlockedThemes: ['space'],
}
```

#### questions.js - Question Structure
```javascript
{
  id: "g1_m1_1",      // NEW format: g{grade}_{subject}{difficulty}_{number}
  grade: 1,           // NEW: 1-5
  subject: "math",    // "math", "science", "reading", "geography"
  topic: "counting",
  difficulty: 1,      // 1-3 within each grade
  question: "What is 2 + 3?",
  options: ["5", "4", "6", "7"],
  correct: 0,         // 0-based index
  explanation: "2 + 3 = 5! Great job! 🎉",
  hint: "Count on your fingers!"
}
```

### Question Filtering Functions

Update all question-fetching functions to include grade parameter:

```javascript
// questions.js
getQuestions(subject, grade, difficulty)
getSessionQuestions(subject, grade, difficulty, count)
getSpeedRoundQuestions(subject, grade, count)  // mixes all difficulties within grade
```

## Content Structure

### Total Question Count
- **Target:** 320 questions minimum
- **Breakdown:** 5 grades × 4 subjects × 3 difficulties × 5+ questions each

### Curriculum Alignment

#### Math (Common Core Aligned)

**Grade 1:**
- Difficulty 1: Counting, addition/subtraction within 10, basic shapes
- Difficulty 2: Addition/subtraction within 20, comparing numbers, simple word problems
- Difficulty 3: Place value (tens/ones), measurement (length), telling time to the hour

**Grade 2:**
- Difficulty 1: Addition/subtraction within 50, skip counting, time to 5 minutes
- Difficulty 2: Addition/subtraction within 100, place value to hundreds, money (coins)
- Difficulty 3: Arrays, even/odd, measuring length in standard units

**Grade 3:**
- Difficulty 1: Multiplication/division basics (×2, ×5, ×10), rounding, simple fractions
- Difficulty 2: Multiplication/division facts to 10, equivalent fractions, telling time to the minute
- Difficulty 3: Multi-step word problems, area/perimeter, measurement conversions

**Grade 4:**
- Difficulty 1: Multi-digit multiplication, factor pairs, comparing fractions
- Difficulty 2: Multi-digit division, adding/subtracting fractions with like denominators, decimals
- Difficulty 3: Equivalent fractions, decimal/fraction conversions, angle measurement

**Grade 5:**
- Difficulty 1: Decimal operations (add/subtract), fraction operations with unlike denominators
- Difficulty 2: Multiplying/dividing decimals, volume of rectangular prisms, coordinate planes
- Difficulty 3: Complex fraction problems, converting measurements, order of operations

#### Science (NGSS-Inspired)

**Grade 1:**
- Difficulty 1: Animal/plant identification, weather types, five senses
- Difficulty 2: Animal needs, plant parts, sun/shadows, sound basics
- Difficulty 3: Seasons, materials properties, light sources

**Grade 2:**
- Difficulty 1: Life cycles (butterfly, frog), habitats, states of matter
- Difficulty 2: Plant growth needs, animal adaptations, landforms
- Difficulty 3: Erosion, pollination, properties of materials (magnetic, sink/float)

**Grade 3:**
- Difficulty 1: Forces (push/pull), magnets, simple machines, planets
- Difficulty 2: Motion, weather vs. climate, moon phases, fossils
- Difficulty 3: Balanced/unbalanced forces, inherited traits, solar system scale

**Grade 4:**
- Difficulty 1: Energy forms, rock types, food chains, light/sound waves
- Difficulty 2: Energy transfer, weathering/erosion, ecosystems, wave properties
- Difficulty 3: Renewable/nonrenewable energy, rock cycle, adaptation, human impact on environment

**Grade 5:**
- Difficulty 1: States of matter, water cycle, organ systems, Earth's layers
- Difficulty 2: Chemical/physical changes, weather patterns, circulatory system, photosynthesis
- Difficulty 3: Conservation of matter, climate zones, body systems interactions, food webs

#### Reading (Common Core ELA)

**Grade 1:**
- Difficulty 1: Sight words, CVC words, simple sentence comprehension
- Difficulty 2: Short vowels, rhyming words, who/what/where questions from 1-2 sentence passages
- Difficulty 3: Blends/digraphs, main idea from short passage, sequencing

**Grade 2:**
- Difficulty 1: Long vowels, vocabulary in context, retelling story events
- Difficulty 2: Prefixes/suffixes, main idea and details, character feelings
- Difficulty 3: Multiple-meaning words, cause and effect, comparing characters

**Grade 3:**
- Difficulty 1: Root words, main idea from multi-paragraph text, literal comprehension
- Difficulty 2: Context clues, character traits with evidence, compare/contrast
- Difficulty 3: Figurative language (similes, metaphors), theme, author's purpose

**Grade 4:**
- Difficulty 1: Greek/Latin roots, summarizing, point of view
- Difficulty 2: Synonyms/antonyms in context, inference, text structure (chronological, cause/effect)
- Difficulty 3: Idioms, theme with supporting details, comparing two texts

**Grade 5:**
- Difficulty 1: Advanced vocabulary, analyzing characters, direct quotes as evidence
- Difficulty 2: Connotation/denotation, theme across multiple paragraphs, author's point of view
- Difficulty 3: Figurative language interpretation, synthesizing information from multiple sources, text structure analysis

#### Geography

**Grade 1:**
- Difficulty 1: Cardinal directions (N/S/E/W), map symbols, neighborhood places
- Difficulty 2: Globe vs. map, land vs. water, community helpers' locations
- Difficulty 3: Simple map reading, city/town/country concepts

**Grade 2:**
- Difficulty 1: 7 continents, 5 oceans, US location on map
- Difficulty 2: Urban/suburban/rural, compass rose, map key/legend
- Difficulty 3: Continent features, country vs. continent, intermediate directions

**Grade 3:**
- Difficulty 1: US regions (Northeast, Southeast, Midwest, Southwest, West), major rivers
- Difficulty 2: State identification, capitals of large states, physical features (mountains, plains)
- Difficulty 3: Climate zones, natural resources by region, comparing regions

**Grade 4:**
- Difficulty 1: All 50 states identification, major US landmarks, bordering countries
- Difficulty 2: State capitals, latitude/longitude basics, population distribution
- Difficulty 3: Economic activities by region, time zones, comparing US to other countries

**Grade 5:**
- Difficulty 1: World countries (major ones), continents in detail, equator/prime meridian
- Difficulty 2: Cultural regions, biomes, international landmarks
- Difficulty 3: Latitude/longitude coordinates, hemispheres, comparing cultures and economies

## Implementation Components

### New Components

#### 1. GradeSelectScreen.jsx
- Visual grade selector with 5 buttons (1st-5th grade)
- Each button displays:
  - Grade number with ordinal (1st, 2nd, 3rd, 4th, 5th)
  - Thematic icon (🚀 for 1st, 🛸 for 2nd, etc.)
  - "Select Grade" action
- Space-themed design matching existing UI
- Clear heading: "Which grade are you in?"
- Confirmation on selection before proceeding
- Props: `{ onGradeSelected: (grade) => void }`

### Modified Components

#### 1. WelcomeScreen.jsx
- Registration flow adds step after username entry
- After successful registration, navigate to grade selection
- Flow: username input → register → grade select → login complete

#### 2. App.jsx
- Add grade migration check in `handleUserLoggedIn()`
- If `gameState.player.grade === null`, show GradeSelectScreen instead of HomeScreen
- Add new screen state: `gradeselect`
- After grade selection, update state and proceed to home

#### 3. storage.js
- Add `grade: null` to DEFAULT_STATE.player
- Add `setUserGrade(grade)` helper function
- Add `resetProgressForGradeChange()` function that:
  - Sets new grade
  - Resets all subject difficulties to 1
  - Clears all subject `answeredQuestions` arrays
  - Clears `recentAnswers` arrays

#### 4. questions.js
- Add `grade` property to all questions
- Update ID convention: `g{grade}_{subject}{difficulty}_{number}`
- Update filter functions:
  ```javascript
  export function getQuestions(subject, grade, difficulty) {
    return QUESTIONS.filter(q => 
      q.subject === subject && 
      q.grade === grade && 
      q.difficulty === difficulty
    )
  }
  
  export function getSessionQuestions(subject, grade, difficulty, count) {
    const pool = getQuestions(subject, grade, difficulty)
    // existing shuffle and selection logic
  }
  
  export function getSpeedRoundQuestions(subject, grade, count) {
    const pool = QUESTIONS.filter(q => 
      q.subject === subject && 
      q.grade === grade
    )
    // mix all difficulties, shuffle, return count
  }
  ```

#### 5. QuizScreen.jsx
- Pass `gameState.player.grade` to `getSessionQuestions()`
- Update call: `getSessionQuestions(subject, gameState.player.grade, difficulty, 10)`

#### 6. SpeedRoundScreen.jsx
- Pass `gameState.player.grade` to `getSpeedRoundQuestions()`
- Update call: `getSpeedRoundQuestions(subject, gameState.player.grade, 30)`

#### 7. gameLogic.js
- Update `generateDailyQuest()` to use grade-filtered questions
- Ensure daily quest only generates for subjects with available questions for the user's grade

#### 8. ParentScreen.jsx
- Add "Change Grade Level" section
- Dropdown to select new grade (1-5)
- Show current grade
- Confirmation dialog on change with warning about progress reset
- On confirm, call `resetProgressForGradeChange(newGrade)` and update state

#### 9. HomeScreen.jsx
- Display grade level in hero section near player name
- Example: "Level 3 Space Cadet · 3rd Grade · 🔥 5 day streak!"

### File Organization

#### questions.js Structure
Organize questions by grade, then subject, then difficulty within a single file:

```javascript
// questions.js

// Grade 1 - Math
const G1_MATH_D1 = [ /* 5+ questions */ ]
const G1_MATH_D2 = [ /* 5+ questions */ ]
const G1_MATH_D3 = [ /* 5+ questions */ ]

// Grade 1 - Science
const G1_SCIENCE_D1 = [ /* 5+ questions */ ]
const G1_SCIENCE_D2 = [ /* 5+ questions */ ]
const G1_SCIENCE_D3 = [ /* 5+ questions */ ]

// Grade 1 - Reading
const G1_READING_D1 = [ /* 5+ questions */ ]
const G1_READING_D2 = [ /* 5+ questions */ ]
const G1_READING_D3 = [ /* 5+ questions */ ]

// Grade 1 - Geography
const G1_GEOGRAPHY_D1 = [ /* 5+ questions */ ]
const G1_GEOGRAPHY_D2 = [ /* 5+ questions */ ]
const G1_GEOGRAPHY_D3 = [ /* 5+ questions */ ]

// Repeat for Grades 2-5...

// Master array
export const QUESTIONS = [
  ...G1_MATH_D1, ...G1_MATH_D2, ...G1_MATH_D3,
  ...G1_SCIENCE_D1, ...G1_SCIENCE_D2, ...G1_SCIENCE_D3,
  ...G1_READING_D1, ...G1_READING_D2, ...G1_READING_D3,
  ...G1_GEOGRAPHY_D1, ...G1_GEOGRAPHY_D2, ...G1_GEOGRAPHY_D3,
  // ... continue for all grades
]
```

**Note:** If file becomes too large (>3000 lines), split into separate files per grade: `questions/grade1.js`, `questions/grade2.js`, etc.

## Testing & Quality Assurance

### Content Quality Checklist
- [ ] All questions align with Common Core (Math/Reading) or NGSS (Science) standards
- [ ] Age-appropriate language and vocabulary for target grade
- [ ] Positive, encouraging explanations with emoji
- [ ] Helpful hints without revealing the answer
- [ ] All 4 answer options are plausible distractors
- [ ] Topics match curriculum scope for each grade

### Technical Testing Scenarios
1. **New user registration**
   - Create new user → see grade selection screen
   - Select grade → grade saved to state
   - Enter game → only grade-appropriate questions appear

2. **Existing user migration**
   - Log in as legacy user (no grade) → redirected to grade selection
   - Select grade → grade persists
   - Return to game normally

3. **Question filtering**
   - Quiz mode: only questions matching user's grade and selected difficulty appear
   - Speed round: questions from all difficulties within grade only
   - Daily quest: generates using grade-appropriate questions

4. **Grade change in parent settings**
   - Access parent settings with PIN
   - Change grade → confirmation dialog appears
   - Confirm → grade updates, difficulties reset to 1, answered questions cleared
   - Quiz shows new grade's content

5. **Error handling**
   - User without grade tries to start quiz → redirected to grade select
   - Question bank missing questions for grade/subject/difficulty → friendly error message
   - Daily quest generation fails → fallback to manual subject selection

### Edge Cases
- User with `grade: null` → forced to GradeSelectScreen before any quiz access
- Parent changes grade mid-session → all in-progress quizzes invalid, return to home
- Question filtering returns empty array → show "No questions available" message
- Legacy questions without `grade` property → filtered out (not shown)

## Migration Strategy

### Backward Compatibility
1. Existing users without `grade` property will have `grade: null`
2. On login, check `player.grade === null`:
   - If null: redirect to GradeSelectScreen with migration message
   - If set: proceed to home normally
3. All existing questions in current questions.js will be replaced with grade-specific questions
4. No data loss: existing user progress (XP, coins, badges) preserved

### Deployment Steps
1. Update DEFAULT_STATE with `grade: null`
2. Add GradeSelectScreen component
3. Update App.jsx with grade migration logic
4. Update all question filtering functions
5. Replace questions.js with new grade-organized content (320+ questions)
6. Update all screens that call question functions
7. Add grade change to ParentScreen
8. Test with both new and legacy users

## Open Questions
None - all requirements clarified.

## Success Criteria
1. New users can select grade during registration
2. Existing users prompted to select grade on next login (one-time)
3. Only grade-appropriate questions appear in all game modes
4. 320+ questions created, organized by grade (1-5), subject (4), difficulty (1-3)
5. Parents can change grade in settings with confirmation
6. Changing grade resets progress appropriately
7. Grade displayed in user profile on home screen
8. All questions align with educational standards for target grade
