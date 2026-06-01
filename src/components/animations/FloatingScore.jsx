// src/components/animations/FloatingScore.jsx
import { useEffect, useState, useRef } from 'react'

export function FloatingScore({ x, y, text, onComplete }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, 1500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <div
      className="fixed pointer-events-none z-[9999] score-float font-bold text-xl"
      style={{
        left: x,
        top: y,
        color: '#fff',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
      }}
    >
      {text}
    </div>
  )
}

// Hook for managing multiple floating scores
export function useFloatingScores() {
  const [scores, setScores] = useState([])
  const nextIdRef = useRef(0)

  const spawn = (x, y, text) => {
    const id = nextIdRef.current++
    setScores(prev => [...prev, { id, x, y, text }])
  }

  const remove = (id) => {
    setScores(prev => prev.filter(s => s.id !== id))
  }

  return {
    scores,
    spawn,
    render: () => scores.map(score => (
      <FloatingScore
        key={score.id}
        x={score.x}
        y={score.y}
        text={score.text}
        onComplete={() => remove(score.id)}
      />
    ))
  }
}
