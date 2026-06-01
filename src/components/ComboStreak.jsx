// src/components/ComboStreak.jsx
import { useEffect, useState } from 'react'

export function ComboStreak({ streak, nextXP }) {
  const [isVisible, setIsVisible] = useState(false)
  const [justIncreased, setJustIncreased] = useState(false)

  useEffect(() => {
    if (streak >= 2) {
      setIsVisible(true)
      setJustIncreased(true)
      setTimeout(() => setJustIncreased(false), 500)
    } else {
      setIsVisible(false)
    }
  }, [streak])

  if (!isVisible) return null

  const multiplier = Math.min(streak, 5)
  const flameSize = Math.min(streak, 5)
  const flameColor = getFlameColor(streak)
  const flameEmoji = '🔥'.repeat(Math.min(flameSize, 4))

  return (
    <div
      className={`fixed top-2 right-2 md:top-20 md:right-4 z-50 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl md:rounded-2xl px-2 py-1.5 md:px-4 md:py-3 shadow-2xl ${justIncreased ? 'flame-pulse' : ''}`}
      style={{
        boxShadow: `0 0 30px ${flameColor}`,
      }}
    >
      <div
        className="text-center mb-0.5 md:mb-1"
        style={{
          fontSize: `${12 + flameSize * 2}px`,
          filter: `drop-shadow(0 0 ${flameSize * 2}px ${flameColor})`,
        }}
      >
        {flameEmoji}
      </div>
      <div className="text-white font-bold text-xs md:text-sm text-center">
        x{multiplier} STREAK!
      </div>
      <div className="text-white text-[10px] md:text-xs text-center opacity-90">
        Next: +{nextXP} XP
      </div>
    </div>
  )
}

function getFlameColor(streak) {
  if (streak >= 5) return '#a855f7'  // purple
  if (streak >= 4) return '#dc2626'  // red
  if (streak >= 3) return '#ef4444'  // light red
  return '#f97316'  // orange
}
