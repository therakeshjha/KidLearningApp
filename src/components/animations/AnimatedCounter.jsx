// src/components/animations/AnimatedCounter.jsx
import { useEffect, useState, useRef } from 'react'

export function AnimatedCounter({ value, duration = 800, className = '', prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(value)
  const animationRef = useRef(null)
  const startValueRef = useRef(value)
  const startTimeRef = useRef(null)

  useEffect(() => {
    startValueRef.current = displayValue
    startTimeRef.current = null

    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      const current = startValueRef.current + (value - startValueRef.current) * easeProgress
      setDisplayValue(Math.round(current))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}
