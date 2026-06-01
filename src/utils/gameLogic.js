// ============================================================
// NOVA Quest — Game Logic Engine
// XP, levels, coins, badges, adaptive difficulty, daily quests
// ============================================================

import { QUESTIONS } from '../data/questions'

// ── Level thresholds (total XP needed to reach each level) ───
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000]
export const MAX_LEVEL = LEVEL_THRESHOLDS.length

// ── XP / Coin rewards by difficulty ──────────────────────────
const DIFF_REWARDS = {
  1: { xp: 10, coins: 5 },
  2: { xp: 15, coins: 8 },
  3: { xp: 25, coins: 12 },
}
const PERFECT_SESSION_BONUS = { xp: 50, coins: 25 }
const DAILY_QUEST_BONUS     = { xp: 50, coins: 30 }
const STREAK_XP_PER_DAY = 5
const MAX_STREAK_BONUS   = 25

// ── Badge definitions ─────────────────────────────────────────
export const BADGES = {
  first_step:   { id: 'first_step',   label: 'First Step',      emoji: '👣', desc: 'Answer your first question'         },
  streak_3:     { id: 'streak_3',     label: 'On Fire!',        emoji: '🔥', desc: 'Reach a 3-day streak'               },
  streak_7:     { id: 'streak_7',     label: 'Unstoppable',     emoji: '⚡', desc: 'Reach a 7-day streak'               },
  math_50:      { id: 'math_50',      label: 'Math Wizard',     emoji: '🔢', desc: '50 math questions correct'          },
  science_50:   { id: 'science_50',   label: 'Space Expert',    emoji: '🔬', desc: '50 science questions correct'       },
  reading_50:   { id: 'reading_50',   label: 'Word Smith',      emoji: '📖', desc: '50 reading questions correct'       },
  geography_50: { id: 'geography_50', label: 'Globe Trotter',   emoji: '🌍', desc: '50 geography questions correct'    },
  speed_demon:  { id: 'speed_demon',  label: 'Speed Demon',     emoji: '💨', desc: 'Get 15+ correct in a Speed Round'  },
  perfect_10:   { id: 'perfect_10',   label: 'Perfect 10!',     emoji: '🏆', desc: '10/10 in a single quiz session'    },
  coin_500:     { id: 'coin_500',     label: 'Coin Collector',  emoji: '💰', desc: 'Earn 500 total coins'               },
  level_5:      { id: 'level_5',      label: 'Nova Commander',  emoji: '🌟', desc: 'Reach Level 5'                     },
  shopper:      { id: 'shopper',      label: 'Galactic Shopper',emoji: '🛍️', desc: 'Unlock 3 items in the shop'        },
}

// ── Level helpers ─────────────────────────────────────────────

export function getLevelFromXP(xp) {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  return Math.min(level, MAX_LEVEL)
}

export function getXPProgress(xp) {
  const level = getLevelFromXP(xp)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold    = LEVEL_THRESHOLDS[level]     ?? LEVEL_THRESHOLDS[MAX_LEVEL - 1]
  const progress = nextThreshold === currentThreshold
    ? 100
    : Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
  return { level, current: xp - currentThreshold, needed: nextThreshold - currentThreshold, pct: Math.min(100, progress) }
}

// ── Answer processing ─────────────────────────────────────────

/**
 * Process a single answer in a quiz session.
 * Returns updated state + metadata about what happened.
 */
export function processAnswer(state, subject, isCorrect, difficulty) {
  const newState = structuredClone(state)
  const subj     = newState.subjects[subject]

  // Track recent answers for adaptive difficulty (last 10)
  subj.recentAnswers = [...subj.recentAnswers, isCorrect].slice(-10)
  subj.totalAnswered++
  if (isCorrect) subj.totalCorrect++

  // Player totals
  newState.player.totalAnswered++
  if (isCorrect) newState.player.totalCorrect++

  // XP + coins if correct
  let xpGained = 0
  let coinsGained = 0
  if (isCorrect) {
    const rewards = DIFF_REWARDS[difficulty] ?? DIFF_REWARDS[1]
    const streakBonus = Math.min(state.player.streak * STREAK_XP_PER_DAY, MAX_STREAK_BONUS)
    xpGained = rewards.xp + streakBonus
    coinsGained = rewards.coins
    newState.player.xp    += xpGained
    newState.player.coins += coinsGained
  }

  // Update level
  newState.player.level = getLevelFromXP(newState.player.xp)

  // Daily quest progress
  if (newState.dailyQuest.subject === subject && !newState.dailyQuest.done) {
    newState.dailyQuest.completed = Math.min(
      newState.dailyQuest.completed + 1,
      newState.dailyQuest.needed
    )
    if (newState.dailyQuest.completed >= newState.dailyQuest.needed) {
      // Award quest completion
      newState.dailyQuest.done = true
      newState.player.xp    += DAILY_QUEST_BONUS.xp
      newState.player.coins += DAILY_QUEST_BONUS.coins
      xpGained    += DAILY_QUEST_BONUS.xp
      coinsGained += DAILY_QUEST_BONUS.coins
    }
  }

  return { newState, xpGained, coinsGained }
}

/**
 * Called at the end of a session (after all questions answered).
 * Handles perfect score bonus, session logging, adaptive difficulty.
 */
export function processSessionEnd(state, subject, correct, total, difficulty) {
  const newState = structuredClone(state)
  let bonusXP = 0
  let bonusCoins = 0

  // Perfect score bonus
  if (correct === total && total > 0) {
    bonusXP = PERFECT_SESSION_BONUS.xp
    bonusCoins = PERFECT_SESSION_BONUS.coins
    newState.player.xp    += bonusXP
    newState.player.coins += bonusCoins
  }

  // Log session (keep last 7)
  const today = getTodayStr()
  const session = { date: today, subject, correct, total, xpEarned: bonusXP }
  newState.sessions = [...newState.sessions.slice(-6), session]

  // Adaptive difficulty
  newState.subjects[subject].difficulty = calcNewDifficulty(
    newState.subjects[subject].recentAnswers,
    newState.subjects[subject].difficulty
  )

  // Badge check
  const newBadges = checkBadges(newState)
  newState.player.badges = [...new Set([...newState.player.badges, ...newBadges])]

  // Update level
  newState.player.level = getLevelFromXP(newState.player.xp)

  return { newState, bonusXP, bonusCoins, newBadges }
}

// ── Adaptive difficulty ───────────────────────────────────────

function calcNewDifficulty(recentAnswers, currentDiff) {
  if (recentAnswers.length < 5) return currentDiff
  const correct = recentAnswers.filter(Boolean).length
  const total   = recentAnswers.length
  if (correct / total >= 0.8 && currentDiff < 3) return currentDiff + 1
  if (correct / total <= 0.4 && currentDiff > 1) return currentDiff - 1
  return currentDiff
}

// ── Badge checking ────────────────────────────────────────────

export function checkBadges(state) {
  const earned = []
  const already = new Set(state.player.badges)
  const check = (id, condition) => { if (!already.has(id) && condition) earned.push(id) }

  check('first_step',   state.player.totalAnswered >= 1)
  check('streak_3',     state.player.streak >= 3)
  check('streak_7',     state.player.streak >= 7)
  check('math_50',      state.subjects.math.totalCorrect >= 50)
  check('science_50',   state.subjects.science.totalCorrect >= 50)
  check('reading_50',   state.subjects.reading.totalCorrect >= 50)
  check('geography_50', state.subjects.geography.totalCorrect >= 50)
  check('perfect_10',   false) // set externally during session
  check('coin_500',     state.player.coins >= 500)
  check('level_5',      state.player.level >= 5)

  return earned
}

// ── Streak + daily quest ──────────────────────────────────────

export function checkDailyStreak(state) {
  const today     = getTodayStr()
  const yesterday = getYesterdayStr()
  const last      = state.player.lastPlayedDate

  let newState = structuredClone(state)

  // Update streak
  if (last === yesterday) {
    // Continuing streak — don't increment yet (happens on first answer)
  } else if (last !== today && last !== yesterday) {
    newState.player.streak = 0 // broken streak
  }

  // Regenerate daily quest if it's a new day
  if (state.dailyQuest.date !== today) {
    newState.dailyQuest = generateDailyQuest(state.player.grade || 5)
  }

  return newState
}

export function recordPlay(state) {
  const today = getTodayStr()
  const newState = structuredClone(state)

  if (newState.player.lastPlayedDate !== today) {
    const yesterday = getYesterdayStr()
    if (newState.player.lastPlayedDate === yesterday) {
      newState.player.streak++ // consecutive day
    } else if (!newState.player.lastPlayedDate) {
      newState.player.streak = 1 // first ever play
    }
    newState.player.lastPlayedDate = today
  }

  return newState
}

export function generateDailyQuest(grade) {
  const subjects = ['math', 'science', 'reading', 'geography']
  const todaySubjectIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % subjects.length
  const subject = subjects[todaySubjectIndex]

  // Check if questions exist for this grade/subject
  const availableQuestions = QUESTIONS.filter(q =>
    q.subject === subject && q.grade === grade
  )

  if (availableQuestions.length === 0) {
    // Fallback to first available subject for this grade
    const fallbackSubject = subjects.find(s =>
      QUESTIONS.some(q => q.subject === s && q.grade === grade)
    )

    return {
      date: new Date().toISOString().split('T')[0],
      subject: fallbackSubject || 'math',
      needed: 10,
      completed: 0,
      xpReward: 50,
      coinsReward: 30,
      done: false,
    }
  }

  return {
    date: new Date().toISOString().split('T')[0],
    subject,
    needed: 10,
    completed: 0,
    xpReward: 50,
    coinsReward: 30,
    done: false,
  }
}

// ── Shop helpers ──────────────────────────────────────────────

export const SHOP_ITEMS = [
  // Starter avatars - Level 1-2
  { id: 'av_alien',    type: 'avatar', emoji: '👽', label: 'Alien Cadet',     cost: 50,  reqLevel: 1 },
  { id: 'av_lion',     type: 'avatar', emoji: '🦁', label: 'Lion Crew',       cost: 75,  reqLevel: 1 },
  { id: 'av_dino',     type: 'avatar', emoji: '🦕', label: 'Dino Explorer',   cost: 100, reqLevel: 2 },
  { id: 'av_soccer',   type: 'avatar', emoji: '⚽', label: 'Soccer Star',     cost: 100, reqLevel: 2 },
  { id: 'av_fox',      type: 'avatar', emoji: '🦊', label: 'Space Fox',       cost: 125, reqLevel: 2 },

  // Dragon Collection - Elemental Dragons
  { id: 'av_dragon',         type: 'avatar', emoji: '🐉', label: 'Space Dragon',     cost: 150, reqLevel: 3 },
  { id: 'av_fire_dragon',    type: 'avatar', emoji: '🐲', label: 'Fire Dragon',      cost: 175, reqLevel: 3 },
  { id: 'av_water_dragon',   type: 'avatar', emoji: '🌊', label: 'Water Dragon',     cost: 175, reqLevel: 3 },
  { id: 'av_ice_dragon',     type: 'avatar', emoji: '❄️', label: 'Ice Dragon',       cost: 200, reqLevel: 4 },
  { id: 'av_thunder_dragon', type: 'avatar', emoji: '⚡', label: 'Thunder Dragon',   cost: 200, reqLevel: 4 },
  { id: 'av_earth_dragon',   type: 'avatar', emoji: '🌍', label: 'Earth Dragon',     cost: 200, reqLevel: 4 },
  { id: 'av_wind_dragon',    type: 'avatar', emoji: '💨', label: 'Wind Dragon',      cost: 225, reqLevel: 4 },
  { id: 'av_light_dragon',   type: 'avatar', emoji: '✨', label: 'Light Dragon',     cost: 225, reqLevel: 5 },
  { id: 'av_shadow_dragon',  type: 'avatar', emoji: '🌑', label: 'Shadow Dragon',    cost: 225, reqLevel: 5 },
  { id: 'av_golden_dragon',  type: 'avatar', emoji: '🟡', label: 'Golden Dragon',    cost: 250, reqLevel: 5 },
  { id: 'av_rainbow_dragon', type: 'avatar', emoji: '🌈', label: 'Rainbow Dragon',   cost: 300, reqLevel: 6 },

  // Color Sphere Dragons
  { id: 'av_red_dragon',     type: 'avatar', emoji: '🔴', label: 'Red Dragon',       cost: 175, reqLevel: 3 },
  { id: 'av_blue_dragon',    type: 'avatar', emoji: '🔵', label: 'Blue Dragon',      cost: 175, reqLevel: 3 },
  { id: 'av_green_dragon',   type: 'avatar', emoji: '🟢', label: 'Green Dragon',     cost: 175, reqLevel: 3 },
  { id: 'av_purple_dragon',  type: 'avatar', emoji: '🟣', label: 'Purple Dragon',    cost: 200, reqLevel: 4 },
  { id: 'av_orange_dragon',  type: 'avatar', emoji: '🟠', label: 'Orange Dragon',    cost: 200, reqLevel: 4 },
  { id: 'av_yellow_dragon',  type: 'avatar', emoji: '🟡', label: 'Yellow Dragon',    cost: 200, reqLevel: 4 },

  // Special creatures - Level 3-4
  { id: 'av_robot',    type: 'avatar', emoji: '🤖', label: 'Robo Nova',       cost: 175, reqLevel: 3 },
  { id: 'av_octopus',  type: 'avatar', emoji: '🐙', label: 'Octo Scholar',    cost: 150, reqLevel: 3 },
  { id: 'av_unicorn',  type: 'avatar', emoji: '🦄', label: 'Cosmic Unicorn',  cost: 200, reqLevel: 4 },
  { id: 'av_tiger',    type: 'avatar', emoji: '🐯', label: 'Tiger Captain',   cost: 175, reqLevel: 3 },
  { id: 'av_panda',    type: 'avatar', emoji: '🐼', label: 'Panda Scholar',   cost: 150, reqLevel: 3 },
  { id: 'av_koala',    type: 'avatar', emoji: '🐨', label: 'Koala Explorer',  cost: 150, reqLevel: 3 },
  { id: 'av_eagle',    type: 'avatar', emoji: '🦅', label: 'Eagle Pilot',     cost: 175, reqLevel: 3 },
  { id: 'av_wolf',     type: 'avatar', emoji: '🐺', label: 'Wolf Ranger',     cost: 175, reqLevel: 3 },
  { id: 'av_owl',      type: 'avatar', emoji: '🦉', label: 'Wise Owl',        cost: 175, reqLevel: 3 },

  // Elite avatars - Level 4-5
  { id: 'av_star',     type: 'avatar', emoji: '🌟', label: 'Star Legend',     cost: 200, reqLevel: 4 },
  { id: 'av_crown',    type: 'avatar', emoji: '👑', label: 'Royal Commander', cost: 250, reqLevel: 5 },
  { id: 'av_hero',     type: 'avatar', emoji: '🦸', label: 'Galaxy Hero',     cost: 250, reqLevel: 5 },
  { id: 'av_wizard',   type: 'avatar', emoji: '🧙', label: 'Space Wizard',    cost: 275, reqLevel: 5 },
  { id: 'av_ninja',    type: 'avatar', emoji: '🥷', label: 'Shadow Ninja',    cost: 275, reqLevel: 5 },

  // Legendary - Level 6+
  { id: 'av_trophy',   type: 'avatar', emoji: '🏆', label: 'Champion',        cost: 300, reqLevel: 6 },
  { id: 'av_diamond',  type: 'avatar', emoji: '💎', label: 'Diamond Elite',   cost: 350, reqLevel: 7 },
  { id: 'av_galaxy',   type: 'avatar', emoji: '🌌', label: 'Galaxy Master',   cost: 400, reqLevel: 8 },

  // Themes - Visual customization
  { id: 'theme_ocean',  type: 'theme', emoji: '🌊', label: 'Ocean Theme',   cost: 200, reqLevel: 3 },
  { id: 'theme_forest', type: 'theme', emoji: '🌲', label: 'Forest Theme',  cost: 200, reqLevel: 3 },
  { id: 'theme_fire',   type: 'theme', emoji: '🔥', label: 'Fire Theme',    cost: 250, reqLevel: 4 },
  { id: 'theme_neon',   type: 'theme', emoji: '💫', label: 'Neon Theme',    cost: 300, reqLevel: 5 },
]

export function buyItem(state, itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId)
  if (!item) return { newState: state, success: false, reason: 'Item not found' }

  if (state.player.coins < item.cost) return { newState: state, success: false, reason: 'Not enough coins' }
  if (state.player.level < item.reqLevel) return { newState: state, success: false, reason: 'Level too low' }

  const newState = structuredClone(state)

  // Handle avatars
  if (item.type === 'avatar') {
    const already = state.player.unlockedAvatars.includes(item.emoji)
    if (already) return { newState: state, success: false, reason: 'Already owned' }

    newState.player.coins -= item.cost
    newState.player.unlockedAvatars = [...newState.player.unlockedAvatars, item.emoji]

    // Shopper badge: check if 3 or more non-default avatars
    const nonDefault = newState.player.unlockedAvatars.filter(a => a !== '🚀')
    if (nonDefault.length >= 3 && !newState.player.badges.includes('shopper')) {
      newState.player.badges = [...newState.player.badges, 'shopper']
    }
  }

  // Handle themes
  if (item.type === 'theme') {
    const themeId = item.id.replace('theme_', '')
    const already = state.player.unlockedThemes.includes(themeId)
    if (already) return { newState: state, success: false, reason: 'Already owned' }

    newState.player.coins -= item.cost
    newState.player.unlockedThemes = [...newState.player.unlockedThemes, themeId]
  }

  return { newState, success: true }
}

// ── Date helpers ──────────────────────────────────────────────

export function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getYesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getAccuracy(answered, correct) {
  if (answered === 0) return 0
  return Math.round((correct / answered) * 100)
}

// ── Combo Streak Functions ───────────────────────────────────

export function updateComboStreak(state, isCorrect) {
  if (isCorrect) {
    const newStreak = (state.sessionState?.comboStreak || 0) + 1
    return {
      ...state,
      sessionState: {
        ...state.sessionState,
        comboStreak: newStreak,
      }
    }
  } else {
    return {
      ...state,
      sessionState: {
        ...state.sessionState,
        comboStreak: 0,
      }
    }
  }
}

export function getStreakMultiplier(streak) {
  if (streak < 2) return 1
  return Math.min(streak, 5) // Cap at 5x
}

export function resetComboStreak(state) {
  return {
    ...state,
    sessionState: {
      ...state.sessionState,
      comboStreak: 0,
    }
  }
}

export function prepareTreasureChest(state, score, xpEarned, coinsEarned, bonusXP, bonusCoins) {
  const chestType = score === 10 ? 'legendary' : score >= 9 ? 'gold' : score >= 7 ? 'silver' : 'bronze'

  const rewards = [
    { icon: '⭐', amount: xpEarned, label: 'XP' },
    { icon: '💰', amount: coinsEarned, label: 'Coins' },
  ]

  if (bonusXP > 0) {
    rewards.push({ icon: '🎁', amount: bonusXP, label: 'Bonus XP' })
  }

  if (bonusCoins > 0) {
    rewards.push({ icon: '🎁', amount: bonusCoins, label: 'Bonus Coins' })
  }

  return {
    ...state,
    sessionState: {
      ...state.sessionState,
      pendingChestData: {
        type: chestType,
        score: (score / 10) * 100,
        rewards,
      },
    }
  }
}

export function clearPendingChest(state) {
  return {
    ...state,
    sessionState: {
      ...state.sessionState,
      pendingChestData: null,
    }
  }
}
