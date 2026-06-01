import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { initState, saveState, getActiveUser, setUserGrade } from './utils/storage'
import { checkDailyStreak } from './utils/gameLogic'
import { getPerformanceConfig } from './utils/performance'
import { applyTheme } from './utils/themes'

import WelcomeScreen       from './screens/WelcomeScreen'
import GradeSelectScreen   from './screens/GradeSelectScreen'
import Header              from './components/Header'
import HomeScreen          from './screens/HomeScreen'
import SubjectSelectScreen from './screens/SubjectSelectScreen'
import QuizScreen          from './screens/QuizScreen'
import SpeedRoundScreen    from './screens/SpeedRoundScreen'
import GamesScreen         from './screens/GamesScreen'
import AchievementsScreen  from './screens/AchievementsScreen'
import ShopScreen          from './screens/ShopScreen'
import ParentScreen        from './screens/ParentScreen'
import LibraryScreen       from './screens/LibraryScreen'
import CastleExplorerGame  from './components/games/CastleExplorerGame'
const ParticleSystem = lazy(() => import('./components/animations/ParticleSystem').then(m => ({ default: m.ParticleSystem })))

// Statically generate 80 stars so they don't re-render
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: ((i * 137.5) % 100).toFixed(2),
  y: ((i * 97.3)  % 100).toFixed(2),
  size: (1 + (i % 3)),
  dur: (2 + (i % 4)) + 's',
  delay: ((i * 0.37) % 4).toFixed(1) + 's',
}))

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getActiveUser())
  const [gameState, setGameState] = useState(() => {
    const loaded = initState()
    return loaded ? checkDailyStreak(loaded) : null
  })
  const [screen, setScreen]           = useState('home')
  const [screenParams, setScreenParams] = useState({})
  const [needsGradeSelection, setNeedsGradeSelection] = useState(false)
  const [perfConfig] = useState(() => getPerformanceConfig())
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // Handle user login
  const handleUserLoggedIn = useCallback(() => {
    const loaded = initState()
    const checkedState = loaded ? checkDailyStreak(loaded) : null
    setGameState(checkedState)
    setIsLoggedIn(true)

    // Check if user needs to select grade
    if (checkedState && checkedState.player.grade === null) {
      setNeedsGradeSelection(true)
      setScreen('gradeselect')
    } else {
      setNeedsGradeSelection(false)
      setScreen('home')
    }
  }, [])

  // Handle grade selection
  const handleGradeSelected = useCallback((grade) => {
    const result = setUserGrade(grade)
    if (result.success) {
      // Reload state with new grade
      const loaded = initState()
      setGameState(loaded ? checkDailyStreak(loaded) : null)
      setNeedsGradeSelection(false)
      setScreen('home')
    }
  }, [])

  // Persist on every state change
  useEffect(() => { saveState(gameState) }, [gameState])

  useEffect(() => {
    console.log('Performance config:', perfConfig)
  }, [perfConfig])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const navigate = useCallback((screenName, params = {}) => {
    setScreen(screenName)
    setScreenParams(params)
    // Scroll to top on nav
    window.scrollTo(0, 0)
  }, [])

  const updateState = useCallback((updater) => {
    setGameState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      return next
    })
  }, [])

  const screenProps = useMemo(
    () => ({ gameState, updateState, navigate, ...screenParams }),
    [gameState, updateState, navigate, screenParams]
  )

  // Show welcome screen if not logged in
  if (!isLoggedIn || !gameState) {
    return <WelcomeScreen onUserLoggedIn={handleUserLoggedIn} />
  }

  // Get current theme
  const currentTheme = gameState.player?.theme || 'space'
  const theme = applyTheme(currentTheme)

  return (
    <div className={`min-h-screen font-game relative ${screen === 'home' ? 'bg-black' : theme.background + ' text-white'}`}>
      {/* Show starfield only on non-home screens */}
      {screen !== 'home' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
          {STARS.map(s => (
            <div
              key={s.id}
              className="absolute rounded-full star"
              style={{
                left: `${s.x}%`,
                top:  `${s.y}%`,
                width:  `${s.size}px`,
                height: `${s.size}px`,
                background: '#ffffff',
                '--dur': s.dur,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Header - only show on home screen */}
      {screen === 'home' && <Header gameState={gameState} navigate={navigate} />}

      {/* Screen content */}
      <div className={`relative z-10 w-full min-h-screen ${screen === 'home' ? '' : 'px-6 pb-6 pt-4'} overflow-y-auto`}>
        {screen === 'gradeselect'  && <GradeSelectScreen onGradeSelected={handleGradeSelected} />}
        {screen === 'home'         && <HomeScreen          {...screenProps} />}
        {screen === 'subjects'     && <SubjectSelectScreen {...screenProps} />}
        {screen === 'castle'       && <CastleExplorerGame  {...screenProps} />}
        {screen === 'quiz'         && <QuizScreen          {...screenProps} />}
        {screen === 'speedround'   && <SpeedRoundScreen    {...screenProps} />}
        {screen === 'library'      && <LibraryScreen       {...screenProps} />}
        {screen === 'games'        && <GamesScreen         {...screenProps} />}
        {screen === 'achievements' && <AchievementsScreen  {...screenProps} />}
        {screen === 'shop'         && <ShopScreen          {...screenProps} />}
        {screen === 'parent'       && <ParentScreen        {...screenProps} />}
      </div>

      {/* Particle System - only on non-home screens */}
      {!prefersReducedMotion && screen !== 'home' && (
        <Suspense fallback={null}>
          <ParticleSystem maxParticles={perfConfig.maxParticles} />
        </Suspense>
      )}
    </div>
  )
}
