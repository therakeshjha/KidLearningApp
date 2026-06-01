// src/components/TreasureChest.jsx
import { useState, useEffect } from 'react'

export function TreasureChest({ chestData, onComplete }) {
  const [phase, setPhase] = useState('appear')
  const { type, score, rewards } = chestData

  useEffect(() => {
    // Appear phase
    const timer1 = setTimeout(() => setPhase('waiting'), 500)
    return () => clearTimeout(timer1)
  }, [])

  const handleTap = () => {
    if (phase !== 'waiting') return

    setPhase('opening')

    // Opening animation
    setTimeout(() => {
      setPhase('revealing')
      if (window.spawnSparkles) {
        window.spawnSparkles(window.innerWidth / 2, window.innerHeight / 2, 20)
      }
    }, 1000)

    // Confetti explosion
    setTimeout(() => {
      setPhase('complete')
      if (window.spawnConfetti) {
        window.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 60, getChestColors(type))
      }
    }, 2500)

    // Transition out
    setTimeout(() => {
      onComplete()
    }, 4000)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black bg-opacity-80"
      onClick={handleTap}
    >
      <div className={`text-8xl mb-8 ${phase === 'appear' ? 'chest-bounce' : ''} ${phase === 'waiting' ? 'chest-jiggle' : ''}`}>
        {getChestEmoji(type)}
      </div>

      {phase === 'waiting' && (
        <div className="text-white text-xl font-bold animate-pulse">
          Tap to open your reward!
        </div>
      )}

      {phase === 'revealing' && (
        <div className="space-y-4">
          {rewards.map((reward, i) => (
            <div
              key={i}
              className="text-white text-2xl font-bold text-center score-float"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              {reward.icon} +{reward.amount} {reward.label}
            </div>
          ))}
        </div>
      )}

      {(phase === 'opening' || phase === 'complete') && (
        <div className="text-white text-lg opacity-50">
          Opening...
        </div>
      )}
    </div>
  )
}

function getChestEmoji(type) {
  switch (type) {
    case 'legendary': return '🎁'
    case 'gold': return '📦'
    case 'silver': return '🎁'
    case 'bronze': return '📦'
    default: return '📦'
  }
}

function getChestColors(type) {
  switch (type) {
    case 'legendary': return ['#f093fb', '#f5576c', '#43e97b', '#4facfe', '#fa709a']
    case 'gold': return ['#ffd700', '#ffed4e', '#f59e0b']
    case 'silver': return ['#c0c0c0', '#e8e8e8', '#94a3b8']
    case 'bronze': return ['#cd7f32', '#d4a574', '#92400e']
    default: return ['#667eea', '#f093fb', '#43e97b']
  }
}
