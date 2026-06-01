import { useState, useEffect, useRef } from 'react'
import { getSessionQuestions, SUBJECT_META } from '../data/questions'
import {
  processAnswer,
  processSessionEnd,
  recordPlay,
  updateComboStreak,
  getStreakMultiplier,
  resetComboStreak,
  prepareTreasureChest,
  clearPendingChest,
  BADGES
} from '../utils/gameLogic'
import { ComboStreak } from '../components/ComboStreak'
import { TreasureChest } from '../components/TreasureChest'
import { BadgeReveal } from '../components/BadgeReveal'

const OPTION_LETTERS = ['A', 'B', 'C', 'D']
const TOTAL_QUESTIONS = 10

export default function QuizScreen({ gameState, updateState, navigate, subject = 'math' }) {
  const meta = SUBJECT_META[subject]

  // Guard: redirect if no grade selected
  if (!gameState.player.grade) {
    navigate('gradeselect')
    return null
  }

  // Load questions once on mount
  const [questions] = useState(() => {
    const diff = gameState.subjects[subject]?.difficulty ?? 1
    const answeredIds = gameState.subjects[subject]?.answeredQuestions ?? []
    return getSessionQuestions(subject, gameState.player.grade, diff, TOTAL_QUESTIONS, answeredIds)
  })

  const [qIndex,   setQIndex]   = useState(0)
  const [selected, setSelected] = useState(null)   // index of chosen option
  const [revealed, setRevealed] = useState(false)  // show answer
  const [correct,  setCorrect]  = useState(0)
  const [xpPopText, setXpPopText] = useState(null)
  const [newBadges, setNewBadges] = useState([])
  const [shake,    setShake]    = useState(false)
  const [done,     setDone]     = useState(false)
  const [results,  setResults]  = useState(null)
  const [difficulty] = useState(gameState.subjects[subject]?.difficulty ?? 1)
  const [comboStreak, setComboStreak] = useState(0)
  const [showTreasure, setShowTreasure] = useState(false)
  const [treasureData, setTreasureData] = useState(null)
  const [revealingBadge, setRevealingBadge] = useState(null)
  const [badgeQueue, setBadgeQueue] = useState([])

  // Track if we already recorded "play" for today
  const playedRef = useRef(false)

  // Badge queue effect: populate queue when badges are earned
  useEffect(() => {
    if (newBadges.length > 0 && badgeQueue.length === 0 && !revealingBadge) {
      setBadgeQueue([...newBadges])
    }
  }, [newBadges, badgeQueue.length, revealingBadge])

  // Badge reveal effect: start revealing next badge in queue
  useEffect(() => {
    if (badgeQueue.length > 0 && !revealingBadge) {
      setRevealingBadge(badgeQueue[0])
    }
  }, [badgeQueue, revealingBadge])

  const q = questions[qIndex]

  function handleAnswer(optionIdx) {
    if (revealed) return
    setSelected(optionIdx)
    setRevealed(true)

    const isCorrect = optionIdx === q.correct

    // Record play once
    if (!playedRef.current) {
      playedRef.current = true
      updateState(prev => recordPlay(prev))
    }

    // Update combo streak
    let newComboStreak = comboStreak
    updateState(prev => {
      const updatedState = updateComboStreak(prev, isCorrect)
      newComboStreak = updatedState.sessionState?.comboStreak || 0
      return updatedState
    })
    setComboStreak(newComboStreak)

    // Get streak multiplier for XP bonus
    const streakMultiplier = getStreakMultiplier(newComboStreak)

    // Process answer (XP, coins, daily quest)
    let xpGained = 0
    let coinsGained = 0
    updateState(prev => {
      const { newState, xpGained: xg, coinsGained: cg } = processAnswer(
        prev, subject, isCorrect, difficulty
      )
      xpGained = xg
      coinsGained = cg
      // Apply streak multiplier to XP
      if (streakMultiplier > 1) {
        const bonusXP = Math.floor(xg * (streakMultiplier - 1))
        newState.player.xp += bonusXP
        xpGained += bonusXP
      }
      // Track this question as answered
      if (!newState.subjects[subject].answeredQuestions.includes(q.id)) {
        newState.subjects[subject].answeredQuestions.push(q.id)
      }
      return newState
    })

    if (isCorrect) {
      setCorrect(c => c + 1)
      setXpPopText(`+${xpGained} ⭐  +${coinsGained} 💰`)

      // Spawn sparkles from the button
      const buttonElement = document.querySelector(`[data-option="${optionIdx}"]`)
      if (buttonElement && window.spawnSparkles) {
        const rect = buttonElement.getBoundingClientRect()
        window.spawnSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 8)
      }
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      // Reset combo on incorrect answer
      updateState(prev => resetComboStreak(prev))
      setComboStreak(0)
    }
  }

  function handleNext() {
    if (qIndex + 1 >= TOTAL_QUESTIONS) {
      // End of session
      const finalCorrect = correct + (selected === q.correct ? 1 : 0)
      let newBadgeList = []
      let sessionXP = 0
      let sessionCoins = 0
      let sessionBonusXP = 0
      let sessionBonusCoins = 0

      updateState(prev => {
        const { newState, bonusXP, bonusCoins, newBadges: nb } = processSessionEnd(
          prev, subject, finalCorrect, TOTAL_QUESTIONS, difficulty
        )
        // Check perfect score badge
        if (finalCorrect === TOTAL_QUESTIONS && !prev.player.badges.includes('perfect_10')) {
          newState.player.badges = [...newState.player.badges, 'perfect_10']
          nb.push('perfect_10')
        }
        newBadgeList = nb
        sessionXP = newState.player.xp - prev.player.xp
        sessionCoins = newState.player.coins - prev.player.coins
        sessionBonusXP = bonusXP
        sessionBonusCoins = bonusCoins
        setResults({ finalCorrect, bonusXP, bonusCoins })
        setNewBadges(nb)
        return newState
      })

      // Prepare treasure chest
      updateState(prev => prepareTreasureChest(
        prev,
        finalCorrect,
        sessionXP,
        sessionCoins,
        sessionBonusXP,
        sessionBonusCoins
      ))

      // Show treasure chest
      const chestType = finalCorrect === 10 ? 'legendary' : finalCorrect >= 9 ? 'gold' : finalCorrect >= 7 ? 'silver' : 'bronze'
      const rewards = [
        { icon: '⭐', amount: sessionXP, label: 'XP' },
        { icon: '💰', amount: sessionCoins, label: 'Coins' },
      ]
      if (sessionBonusXP > 0) {
        rewards.push({ icon: '🎁', amount: sessionBonusXP, label: 'Bonus XP' })
      }
      if (sessionBonusCoins > 0) {
        rewards.push({ icon: '🎁', amount: sessionBonusCoins, label: 'Bonus Coins' })
      }

      setTreasureData({ type: chestType, score: finalCorrect, rewards })
      setShowTreasure(true)
    } else {
      setQIndex(i => i + 1)
      setSelected(null)
      setRevealed(false)
      setXpPopText(null)
    }
  }

  // Show treasure chest before results
  if (showTreasure && treasureData) {
    return (
      <TreasureChest
        chestData={treasureData}
        onComplete={() => {
          setShowTreasure(false)
          setDone(true)
          updateState(prev => clearPendingChest(prev))
        }}
      />
    )
  }

  // Show badge reveal(s) after treasure chest, before results
  if (revealingBadge) {
    return (
      <BadgeReveal
        badgeId={revealingBadge}
        onComplete={() => {
          setBadgeQueue(prev => prev.slice(1))
          setRevealingBadge(null)
        }}
      />
    )
  }

  if (done && results) {
    return (
      <ResultsScreen
        correct={results.finalCorrect}
        total={TOTAL_QUESTIONS}
        bonusXP={results.bonusXP}
        bonusCoins={results.bonusCoins}
        newBadges={newBadges}
        subject={subject}
        navigate={navigate}
      />
    )
  }

  if (!q) return null

  const pct = Math.round(((qIndex) / TOTAL_QUESTIONS) * 100)

  // Calculate next XP for combo streak display
  const baseXP = difficulty === 3 ? 25 : difficulty === 2 ? 15 : 10
  const nextMultiplier = getStreakMultiplier(comboStreak + 1)
  const nextXP = Math.floor(baseXP * nextMultiplier)

  return (
    <div className="slide-up">
      {/* Combo Streak Indicator */}
      {!done && (
        <ComboStreak
          streak={comboStreak}
          nextXP={nextXP}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('subjects')} className="text-slate-400 hover:text-white text-lg">←</button>
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: meta.accent }}>{meta.emoji} {meta.label.replace('Planet ', '').replace('World ', '').replace('Realm ', '')}</span>
        </div>
        <span className="text-slate-400 text-sm">{qIndex + 1}/{TOTAL_QUESTIONS}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-black rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: meta.accent }}
        />
      </div>

      {/* Score tracker */}
      <div className="flex justify-between text-sm mb-4 text-slate-400">
        <span>✅ {correct} correct</span>
        <span className="text-xs">Difficulty: {'⭐'.repeat(difficulty)}</span>
        <span>❌ {qIndex - correct} wrong</span>
      </div>

      {/* Question card */}
      <div className="galactic-card p-5 mb-5 relative" style={{ borderColor: meta.accent + '44' }}>
        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: meta.accent }}>
          {q.topic}
        </div>
        <div className="text-lg font-semibold leading-snug">{q.question}</div>

        {/* XP pop animation */}
        {xpPopText && (
          <div
            key={qIndex + '-pop'}
            className="absolute top-2 right-4 font-bold text-galactic-yellow text-sm pointer-events-none xp-pop"
          >
            {xpPopText}
          </div>
        )}
      </div>

      {/* Answer options */}
      <div className={`grid grid-cols-1 gap-3 ${shake ? 'shake' : ''}`}>
        {q.options.map((opt, i) => {
          let btnStyle = 'border-2 transition-all duration-200'
          let bgColor = 'rgba(0, 0, 0, 0.6)'
          let borderColor = '#ff1493'
          let textColor = '#ffffff'

          if (revealed) {
            if (i === q.correct) {
              bgColor = 'rgba(0, 255, 135, 0.2)'
              borderColor = '#00ff87'
              textColor = '#00ff87'
              btnStyle += ' glow-green'
            } else if (i === selected && i !== q.correct) {
              bgColor = 'rgba(255, 68, 68, 0.2)'
              borderColor = '#ff4444'
              textColor = '#ff4444'
            } else {
              bgColor = 'rgba(0, 0, 0, 0.4)'
              borderColor = 'rgba(255, 255, 255, 0.1)'
              textColor = 'rgba(255, 255, 255, 0.3)'
              btnStyle += ' opacity-50'
            }
          } else {
            btnStyle += ' hover:border-opacity-100 hover:shadow-lg cursor-pointer'
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={revealed}
              data-option={i}
              className={`w-full text-left p-4 rounded-xl font-medium flex items-center gap-3 ${btnStyle}`}
              style={{
                background: bgColor,
                borderColor: borderColor,
                color: textColor,
                boxShadow: revealed && i === q.correct ? '0 0 30px rgba(0, 255, 135, 0.4)' : 'none'
              }}
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                style={{
                  background: revealed && i === q.correct ? '#00ff87' : revealed && i === selected ? '#ff4444' : '#ff1493',
                  color: '#000000'
                }}
              >
                {OPTION_LETTERS[i]}
              </span>
              <span>{opt}</span>
              {revealed && i === q.correct && <span className="ml-auto">✅</span>}
              {revealed && i === selected && i !== q.correct && <span className="ml-auto">❌</span>}
            </button>
          )
        })}
      </div>

      {/* Explanation + Next */}
      {revealed && (
        <div className="mt-5 slide-up">
          <div className={`galactic-card p-4 mb-4 ${selected === q.correct ? 'border-galactic-green glow-green' : 'border-galactic-red'}`}>
            <div className={`font-bold mb-1 ${selected === q.correct ? 'text-galactic-green' : 'text-galactic-red'}`}>
              {selected === q.correct ? '🎉 Correct! Stardust collected!' : '💡 Not quite — but here\'s why:'}
            </div>
            <div className="text-sm text-slate-300">{q.explanation}</div>
            {q.hint && selected !== q.correct && (
              <div className="text-xs text-slate-500 mt-2">Hint: {q.hint}</div>
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}bb)` }}
          >
            {qIndex + 1 >= TOTAL_QUESTIONS ? '🚀 See Results!' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Results screen ────────────────────────────────────────────
function ResultsScreen({ correct, total, bonusXP, bonusCoins, newBadges, subject, navigate }) {
  const meta = SUBJECT_META[subject]
  const pct  = Math.round((correct / total) * 100)

  const rank =
    pct === 100 ? { label: 'PERFECT! 🏆', color: 'text-galactic-yellow' } :
    pct >= 80   ? { label: 'Excellent! 🌟', color: 'text-galactic-green' } :
    pct >= 60   ? { label: 'Good job! 👍', color: 'text-galactic-blue' } :
    pct >= 40   ? { label: 'Keep going! 💪', color: 'text-galactic-yellow' } :
                  { label: 'Try again! 🚀', color: 'text-galactic-purple' }

  return (
    <div className="slide-up text-center">
      <div className="galactic-card p-6 mb-4">
        <div className="text-6xl mb-3 float">{meta.emoji}</div>
        <div className={`text-2xl font-bold mb-1 ${rank.color}`}>{rank.label}</div>
        <div className="text-slate-400 text-sm mb-4">
          {meta.label} complete!
        </div>

        {/* Score circle */}
        <div
          className="inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold mb-4 border-4"
          style={{ borderColor: meta.accent, color: meta.accent }}
        >
          {correct}/{total}
        </div>

        <div className="text-slate-400 text-sm">{pct}% accuracy</div>
      </div>

      {/* Rewards */}
      {bonusXP > 0 && (
        <div className="galactic-card p-4 mb-4 border-galactic-yellow text-center glow-yellow">
          <div className="text-galactic-yellow font-bold text-lg">🎊 Perfect Score Bonus!</div>
          <div className="text-sm text-slate-300 mt-1">+{bonusXP} XP &nbsp;+{bonusCoins} 💰</div>
        </div>
      )}

      {/* New badges */}
      {newBadges.length > 0 && (
        <div className="galactic-card p-4 mb-4 border-galactic-purple">
          <div className="font-bold mb-3 text-galactic-purple">🏅 New Badge{newBadges.length > 1 ? 's' : ''} Unlocked!</div>
          {newBadges.map((bid, i) => {
            const b = BADGES[bid]
            return b ? (
              <div key={bid} className="bounce-in flex items-center gap-3 bg-black rounded-xl p-3 mb-2"
                style={{ animationDelay: `${i * 0.15}s` }}>
                <span className="text-3xl">{b.emoji}</span>
                <div>
                  <div className="font-bold">{b.label}</div>
                  <div className="text-xs text-slate-400">{b.desc}</div>
                </div>
              </div>
            ) : null
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('home')}
          className="flex-1 py-3 rounded-xl border border-slate-700 font-bold text-slate-300 hover:border-slate-500 transition-colors"
        >
          🏠 Home
        </button>
        <button
          onClick={() => navigate('quiz', { subject })}
          className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}bb)` }}
        >
          🔄 Play Again
        </button>
      </div>

      <button
        onClick={() => navigate('subjects')}
        className="w-full mt-3 py-2.5 text-slate-400 hover:text-white text-sm transition-colors"
      >
        🗺️ Choose a different planet
      </button>
    </div>
  )
}
