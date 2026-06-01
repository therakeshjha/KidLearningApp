// ============================================================
// Galactic Quest — localStorage persistence layer
// Multi-user support: each user has their own game state
// ============================================================

const USERS_KEY = 'galactic_users'           // Array of usernames
const ACTIVE_USER_KEY = 'galactic_active_user' // Currently logged in username
const getUserKey = (username) => `galactic_user_${username}` // Individual user state

// ── Default state ────────────────────────────────────────────
export const DEFAULT_STATE = {
  player: {
    name: 'Commander Galactic',
    avatar: '🚀',
    theme: 'space',
    level: 1,
    xp: 0,
    coins: 50, // starter coins so the shop feels reachable immediately
    streak: 0,
    lastPlayedDate: null,  // 'YYYY-MM-DD'
    totalAnswered: 0,
    totalCorrect: 0,
    badges: [],
    unlockedAvatars: ['🚀'],
    unlockedThemes: ['space'],
    grade: null,  // 1, 2, 3, 4, or 5 (null for legacy users)
  },

  subjects: {
    math:      { difficulty: 1, recentAnswers: [], totalAnswered: 0, totalCorrect: 0, answeredQuestions: [] },
    science:   { difficulty: 1, recentAnswers: [], totalAnswered: 0, totalCorrect: 0, answeredQuestions: [] },
    reading:   { difficulty: 1, recentAnswers: [], totalAnswered: 0, totalCorrect: 0, answeredQuestions: [] },
    geography: { difficulty: 1, recentAnswers: [], totalAnswered: 0, totalCorrect: 0, answeredQuestions: [] },
  },

  dailyQuest: {
    date: null,
    subject: 'math',
    needed: 10,
    completed: 0,
    xpReward: 50,
    coinsReward: 30,
    done: false,
  },

  // Ring-buffer of last 7 sessions
  sessions: [],

  settings: {
    parentPin: '1234',
    timeLimitMins: 30,
    soundEnabled: false,
    particlesEnabled: true,
  },

  // NEW: Session state (temporary, not persisted long-term)
  sessionState: {
    comboStreak: 0,
    pendingChestData: null,
  },
}

// ── Multi-user management ──────────────────────────────────────

/** Get list of all registered users */
export function getAllUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Get currently active username */
export function getActiveUser() {
  return localStorage.getItem(ACTIVE_USER_KEY)
}

/** Check if username exists */
export function userExists(username) {
  const users = getAllUsers()
  return users.some(u => u.toLowerCase() === username.toLowerCase())
}

/** Register new user */
export function registerUser(username) {
  const trimmed = username.trim()
  if (!trimmed) return { success: false, error: 'Username cannot be empty' }
  if (trimmed.length < 3) return { success: false, error: 'Username must be at least 3 characters' }
  if (trimmed.length > 20) return { success: false, error: 'Username must be 20 characters or less' }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { success: false, error: 'Username can only contain letters, numbers, and underscores' }
  }

  if (userExists(trimmed)) {
    return { success: false, error: 'Username already exists' }
  }

  // Add to users list
  const users = getAllUsers()
  users.push(trimmed)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))

  // Create fresh state for new user
  const freshState = structuredClone(DEFAULT_STATE)
  freshState.player.name = trimmed
  localStorage.setItem(getUserKey(trimmed), JSON.stringify(freshState))

  return { success: true }
}

/** Login user (set as active) */
export function loginUser(username) {
  if (!userExists(username)) {
    return { success: false, error: 'User not found' }
  }
  localStorage.setItem(ACTIVE_USER_KEY, username)
  return { success: true }
}

/** Logout current user */
export function logoutUser() {
  localStorage.removeItem(ACTIVE_USER_KEY)
}

// ── Core helpers (modified for multi-user) ──────────────────────

/** Load state for active user */
export function loadState() {
  const activeUser = getActiveUser()
  if (!activeUser) return null

  try {
    const raw = localStorage.getItem(getUserKey(activeUser))
    if (!raw) return structuredClone(DEFAULT_STATE)
    const saved = JSON.parse(raw)
    // Deep-merge: saved data on top of defaults (protects against new keys in future)
    return deepMerge(structuredClone(DEFAULT_STATE), saved)
  } catch {
    return structuredClone(DEFAULT_STATE)
  }
}

/** Save full state for active user */
export function saveState(state) {
  const activeUser = getActiveUser()
  if (!activeUser) return

  try {
    localStorage.setItem(getUserKey(activeUser), JSON.stringify(state))
  } catch (e) {
    console.warn('Galactic Quest: could not save state', e)
  }
}

/** Initialize state (load or create) - returns null if no active user */
export function initState() {
  return loadState()
}

/** Wipe current user's data and return fresh default state */
export function resetState() {
  const activeUser = getActiveUser()
  if (!activeUser) return null

  localStorage.removeItem(getUserKey(activeUser))
  const fresh = structuredClone(DEFAULT_STATE)
  fresh.player.name = activeUser
  saveState(fresh)
  return fresh
}

/** Reset answered questions pool for all subjects (allows questions to repeat) */
export function resetQuestionPool(state) {
  const newState = { ...state }
  Object.keys(newState.subjects).forEach(subject => {
    newState.subjects[subject].answeredQuestions = []
  })
  return newState
}

// ── Deep merge utility ────────────────────────────────────────
function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

// ── Grade management ────────────────────────────────────────

/** Set grade for active user */
export function setUserGrade(grade) {
  const activeUser = getActiveUser()
  if (!activeUser) return { success: false, error: 'No active user' }

  if (![1, 2, 3, 4, 5].includes(grade)) {
    return { success: false, error: 'Grade must be 1-5' }
  }

  const state = loadState()
  if (!state) return { success: false, error: 'Could not load state' }

  state.player.grade = grade
  saveState(state)
  return { success: true }
}

/** Reset progress when changing grade */
export function resetProgressForGradeChange(newGrade) {
  const activeUser = getActiveUser()
  if (!activeUser) return { success: false, error: 'No active user' }

  if (![1, 2, 3, 4, 5].includes(newGrade)) {
    return { success: false, error: 'Grade must be 1-5' }
  }

  const state = loadState()
  if (!state) return { success: false, error: 'Could not load state' }

  // Update grade
  state.player.grade = newGrade

  // Reset subject difficulties to 1
  Object.keys(state.subjects).forEach(subject => {
    state.subjects[subject].difficulty = 1
    state.subjects[subject].recentAnswers = []
    state.subjects[subject].answeredQuestions = []
  })

  saveState(state)
  return { success: true, state }
}
