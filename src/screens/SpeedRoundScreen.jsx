import { useState, useEffect, useRef, useCallback } from 'react'
import { QUESTIONS, SUBJECT_META, getSpeedRoundQuestions } from '../data/questions'
import { processAnswer, recordPlay, BADGES } from '../utils/gameLogic'

const SPEED_DURATION = 60  // seconds
const OPTION_LETTERS = ['A', 'B', 'C', 'D']
const SUBJECTS = ['math', 'science', 'reading', 'geography']

// Build a big shuffled pool from all subjects, excluding answered questions
function buildPool(gameState) {
  const allAnsweredIds = []
  SUBJECTS.forEach(subject => {
    const answeredIds = gameState.subjects[subject]?.answeredQuestions ?? []
    allAnsweredIds.push(...answeredIds)
  })

  const availableQuestions = QUESTIONS.filter(q => !allAnsweredIds.includes(q.id))

  // If all questions answered, reset and use all questions
  if (availableQuestions.length < 30) {
    console.log('All questions answered for speed round! Resetting question pool.')
    return [...QUESTIONS].sort(() => Math.random() - 0.5)
  }

  return availableQuestions.sort(() => Math.random() - 0.5)
}

export default function SpeedRoundScreen({ gameState, updateState, navigate }) {
  // Guard: redirect if no grade selected
  if (!gameState.player.grade) {
    navigate('gradeselect')
    return null
  }

  const [phase, setPhase] = useState('intro')  // 'intro' | 'playing' | 'done'
  const [selectedSubject, setSelectedSubject] = useState('all')

  const [pool, setPool]       = useState([])
  const [qIdx, setQIdx]       = useState(0)
  const [timeLeft, setTimeLeft] = useState(SPEED_DURATION)
  const [correct, setCorrect] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [chosen, setChosen]   = useState(null)    // chosen option index
  const [feedback, setFeedback] = useState(null)  // 'correct' | 'wrong'
  const [streak, setStreak]   = useState(0)       // current in-game streak
  const [bestScore] = useState(() => {
    try { return parseInt(localStorage.getItem('nova_speedbest') || '0') }
    catch { return 0 }
  })
  const [finalScore, setFinalScore] = useState(0)
  const [newBadge, setNewBadge]     = useState(false)

  const timerRef    = useRef(null)
  const feedbackRef = useRef(null)
  const playedRef   = useRef(false)

  const q = pool[qIdx]

  function startGame() {
    let filtered
    if (selectedSubject === 'all') {
      filtered = buildPool(gameState)
    } else {
      const answeredIds = gameState.subjects[selectedSubject]?.answeredQuestions ?? []
      filtered = getSpeedRoundQuestions(selectedSubject, gameState.player.grade, 30, answeredIds)
    }
    setPool(filtered.length > 0 ? filtered : buildPool(gameState))
    setQIdx(0)
    setTimeLeft(SPEED_DURATION)
    setCorrect(0)
    setAnswered(0)
    setChosen(null)
    setFeedback(null)
    setStreak(0)
    setPhase('playing')
  }

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          endGame()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const endGame = useCallback(() => {
    setPhase('done')
    clearInterval(timerRef.current)
  }, [])

  function handleAnswer(optIdx) {
    if (chosen !== null || phase !== 'playing') return

    if (!playedRef.current) {
      playedRef.current = true
      updateState(prev => recordPlay(prev))
    }

    const isCorrect = optIdx === q.correct
    setChosen(optIdx)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setAnswered(a => a + 1)

    if (isCorrect) {
      setCorrect(c => {
        const next = c + 1
        setFinalScore(next)
        return next
      })
      setStreak(s => s + 1)
      // Give XP/coins and track question as answered
      updateState(prev => {
        const diff = prev.subjects[q.subject]?.difficulty ?? 1
        const { newState } = processAnswer(prev, q.subject, true, diff)
        // Track this question as answered
        if (!newState.subjects[q.subject].answeredQuestions.includes(q.id)) {
          newState.subjects[q.subject].answeredQuestions.push(q.id)
        }
        return newState
      })
    } else {
      setStreak(0)
      // Track wrong answers too, so they don't repeat
      updateState(prev => {
        const newState = { ...prev }
        if (!newState.subjects[q.subject].answeredQuestions.includes(q.id)) {
          newState.subjects[q.subject].answeredQuestions.push(q.id)
        }
        return newState
      })
    }

    // Brief flash then next question
    feedbackRef.current = setTimeout(() => {
      setChosen(null)
      setFeedback(null)
      setQIdx(i => {
        // Wrap around if we've exhausted the pool
        const next = (i + 1) % pool.length
        return next
      })
    }, isCorrect ? 400 : 700)
  }

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(timerRef.current)
    clearTimeout(feedbackRef.current)
  }, [])

  // On game end: save best score + check badge
  useEffect(() => {
    if (phase !== 'done') return
    if (correct > bestScore) {
      localStorage.setItem('nova_speedbest', String(correct))
    }
    if (correct >= 15) {
      setNewBadge(true)
      updateState(prev => {
        if (prev.player.badges.includes('speed_demon')) return prev
        return { ...prev, player: { ...prev.player, badges: [...prev.player.badges, 'speed_demon'] } }
      })
    }
  }, [phase])

  if (phase === 'intro') {
    return (
      <div className="slide-up">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('home')} className="text-slate-400 hover:text-white text-lg">←</button>
          <h1 className="text-xl font-bold text-galactic-purple">⚡ Speed Round</h1>
        </div>

        <div className="galactic-card p-5 mb-5 text-center glow-purple">
          <div className="text-5xl mb-3 float">⚡</div>
          <div className="text-xl font-bold mb-2">60 Seconds. Maximum Stardust.</div>
          <div className="text-slate-400 text-sm leading-relaxed mb-4">
            Answer as many questions as you can before time runs out!
            Each correct answer earns XP & coins.
            Beat your personal best to prove you're the true Galaxy Commander!
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-galactic-yellow">{bestScore}</div>
              <div className="text-slate-500 text-xs">Personal Best</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-galactic-purple">15+</div>
              <div className="text-slate-500 text-xs">for Speed Demon 💨</div>
            </div>
          </div>
        </div>

        <div className="galactic-card p-4 mb-5">
          <div className="text-sm mb-3 font-semibold" style={{ color: '#00ffff' }}>Choose subject:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedSubject('all')}
              className="py-2 rounded-xl text-sm font-bold transition-all border-2"
              style={selectedSubject === 'all' ? {
                background: 'rgba(124, 58, 237, 0.3)',
                borderColor: '#7c3aed',
                color: '#ffffff'
              } : {
                background: 'rgba(0, 0, 0, 0.6)',
                borderColor: '#ff1493',
                color: '#00ffff'
              }}
            >
              🌌 All Mix
            </button>
            {SUBJECTS.map(s => {
              const m = SUBJECT_META[s]
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className="py-2 rounded-xl text-sm font-bold transition-all border-2"
                  style={selectedSubject === s ? {
                    background: `${m.accent}33`,
                    borderColor: m.accent,
                    color: '#ffffff'
                  } : {
                    background: 'rgba(0, 0, 0, 0.6)',
                    borderColor: '#ff1493',
                    color: '#00ffff'
                  }}
                >
                  {m.emoji}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-95 glow-purple"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
        >
          ⚡ LAUNCH SPEED ROUND!
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    const isNewBest = correct > bestScore
    const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0

    return (
      <div className="slide-up text-center">
        <div className="galactic-card p-6 mb-4 glow-purple">
          <div className="text-5xl mb-3 float">⚡</div>
          <div className="text-2xl font-bold text-galactic-purple mb-1">Time's Up!</div>
          <div className="text-5xl font-bold text-white my-4">{correct}</div>
          <div className="text-slate-400 text-sm">questions correct</div>

          {isNewBest && (
            <div className="mt-3 py-2 px-4 bg-galactic-yellow rounded-xl text-black font-bold inline-block bounce-in">
              🏆 NEW PERSONAL BEST!
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="galactic-card p-3 text-center">
            <div className="text-xl font-bold text-galactic-green">{correct}</div>
            <div className="text-xs text-slate-500">Correct</div>
          </div>
          <div className="galactic-card p-3 text-center">
            <div className="text-xl font-bold text-galactic-red">{answered - correct}</div>
            <div className="text-xs text-slate-500">Wrong</div>
          </div>
          <div className="galactic-card p-3 text-center">
            <div className="text-xl font-bold text-galactic-blue">{pct}%</div>
            <div className="text-xs text-slate-500">Accuracy</div>
          </div>
        </div>

        {newBadge && (
          <div className="galactic-card p-4 mb-4 border-galactic-purple bounce-in">
            <div className="text-3xl mb-1">💨</div>
            <div className="font-bold text-galactic-purple">Speed Demon Badge Unlocked!</div>
            <div className="text-xs text-slate-400">15+ correct in Speed Round</div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('home')}
            className="flex-1 py-3 rounded-xl border border-slate-700 font-bold text-slate-300 hover:border-slate-500 transition-colors"
          >
            🏠 Home
          </button>
          <button
            onClick={() => setPhase('intro')}
            className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            ⚡ Play Again
          </button>
        </div>
      </div>
    )
  }

  // ── Playing phase ───────────────────────────────────────────
  if (!q) return null

  const timerPct = (timeLeft / SPEED_DURATION) * 100
  const timerColor = timeLeft > 30 ? '#3b82f6' : timeLeft > 10 ? '#f59e0b' : '#ef4444'
  const meta = SUBJECT_META[q.subject]

  return (
    <div>
      {/* Timer */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="text-2xl font-bold tabular-nums w-12"
          style={{ color: timerColor }}
        >
          {timeLeft}s
        </div>
        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000 linear"
            style={{ width: `${timerPct}%`, background: timerColor }}
          />
        </div>
        <div className="text-galactic-green font-bold text-sm w-16 text-right">
          ✅ {correct}
        </div>
      </div>

      {/* Streak indicator */}
      {streak >= 3 && (
        <div className="text-center text-xs font-bold text-galactic-orange mb-2 animate-bounce">
          🔥 {streak} in a row! COMBO!
        </div>
      )}

      {/* Subject tag */}
      <div className="flex justify-between items-center mb-3">
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{ background: meta.accent + '33', color: meta.accent }}
        >
          {meta.emoji} {q.subject}
        </span>
        <span className="text-xs text-slate-500">{q.topic}</span>
      </div>

      {/* Question */}
      <div
        className={`galactic-card p-4 mb-4 ${feedback === 'correct' ? 'border-galactic-green glow-green' : feedback === 'wrong' ? 'border-galactic-red' : ''}`}
        style={{ borderColor: feedback ? undefined : meta.accent + '44', transition: 'border-color 0.2s' }}
      >
        <div className="font-semibold text-base leading-snug">{q.question}</div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          let bgColor = 'rgba(0, 0, 0, 0.6)'
          let borderColor = '#ff1493'
          let textColor = '#ffffff'
          let btnClass = 'border-2 transition-all duration-150'

          if (chosen !== null) {
            if (i === q.correct) {
              bgColor = 'rgba(0, 255, 135, 0.2)'
              borderColor = '#00ff87'
              textColor = '#00ff87'
              btnClass += ' glow-green'
            } else if (i === chosen) {
              bgColor = 'rgba(255, 68, 68, 0.2)'
              borderColor = '#ff4444'
              textColor = '#ff4444'
            } else {
              bgColor = 'rgba(0, 0, 0, 0.4)'
              borderColor = 'rgba(255, 255, 255, 0.1)'
              textColor = 'rgba(255, 255, 255, 0.3)'
              btnClass += ' opacity-40'
            }
          } else {
            btnClass += ' hover:border-opacity-100 cursor-pointer'
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={chosen !== null}
              className={`p-3 rounded-xl font-medium text-left text-sm flex items-start gap-2 ${btnClass}`}
              style={{
                background: bgColor,
                borderColor: borderColor,
                color: textColor,
                boxShadow: chosen !== null && i === q.correct ? '0 0 30px rgba(0, 255, 135, 0.4)' : 'none'
              }}
            >
              <span
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: chosen !== null && i === q.correct ? '#00ff87' : chosen !== null && i === chosen ? '#ff4444' : '#ff1493',
                  color: '#000000'
                }}
              >
                {OPTION_LETTERS[i]}
              </span>
              <span className="leading-snug">{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Quick stats */}
      <div className="flex justify-between text-xs text-slate-600 mt-4">
        <span>Best: {bestScore}</span>
        <span>Answered: {answered}</span>
        <span>Accuracy: {answered > 0 ? Math.round(correct / answered * 100) : 0}%</span>
      </div>
    </div>
  )
}
