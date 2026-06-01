// src/components/BadgeReveal.jsx
import { useState, useEffect } from 'react'
import { BADGES } from '../utils/gameLogic'

export function BadgeReveal({ badgeId, onComplete }) {
  const [phase, setPhase] = useState('enter')
  const badge = BADGES[badgeId]

  useEffect(() => {
    // Enter animation
    const timer1 = setTimeout(() => {
      setPhase('revealed')
      if (window.spawnConfetti) {
        window.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 60)
      }
    }, 600)

    return () => clearTimeout(timer1)
  }, [])

  if (!badge) return null

  const handleContinue = () => {
    setPhase('exit')
    setTimeout(onComplete, 300)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black bg-opacity-90"
      onClick={phase === 'revealed' ? handleContinue : undefined}
    >
      <div className={`text-center ${phase === 'enter' ? 'badge-reveal' : ''}`}>
        <div
          className="text-9xl mb-6 glow-pulse"
          style={{ '--glow-color': 'rgba(102, 126, 234, 0.6)' }}
        >
          {badge.emoji}
        </div>

        {phase === 'revealed' && (
          <>
            <h2 className="text-4xl font-bold text-white mb-3 gradient-text-purple slide-up">
              {badge.label}
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-md slide-up" style={{ animationDelay: '100ms' }}>
              {badge.desc}
            </p>
            <button
              className="bg-gradient-purple text-white px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform slide-up"
              style={{ animationDelay: '200ms' }}
              onClick={handleContinue}
            >
              Awesome! ✨
            </button>
          </>
        )}
      </div>
    </div>
  )
}
