// src/components/animations/ParticleSystem.jsx
import { useEffect, useRef, useState, useCallback } from 'react'

export function ParticleSystem({ maxParticles = 60 }) {
  const [particles, setParticles] = useState([])
  const nextIdRef = useRef(0)

  // Create particle spawn functions
  const spawnConfetti = useCallback((x, y, count = 30, colors = ['#667eea', '#f093fb', '#43e97b']) => {
    const newParticles = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const velocity = 200 + Math.random() * 100
      newParticles.push({
        id: nextIdRef.current++,
        type: 'confetti',
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 300,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        shape: ['square', 'circle', 'triangle'][Math.floor(Math.random() * 3)],
        lifetime: 2000 + Math.random() * 1000,
        startTime: Date.now(),
      })
    }
    setParticles(prev => [...prev, ...newParticles].slice(-maxParticles))
  }, [maxParticles])

  const spawnSparkles = useCallback((x, y, count = 10) => {
    const newParticles = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const velocity = 50 + Math.random() * 100
      newParticles.push({
        id: nextIdRef.current++,
        type: 'sparkle',
        x,
        y,
        dx: Math.cos(angle) * velocity,
        dy: Math.sin(angle) * velocity - 50,
        lifetime: 800 + Math.random() * 400,
        startTime: Date.now(),
      })
    }
    setParticles(prev => [...prev, ...newParticles].slice(-maxParticles))
  }, [maxParticles])

  // Animation loop
  useEffect(() => {
    let animationFrameId

    const animate = () => {
      const now = Date.now()
      setParticles(prev =>
        prev.filter(particle => {
          const elapsed = now - particle.startTime
          return elapsed < particle.lifetime
        })
      )
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  // Expose spawn functions globally
  useEffect(() => {
    window.spawnConfetti = spawnConfetti
    window.spawnSparkles = spawnSparkles
    return () => {
      delete window.spawnConfetti
      delete window.spawnSparkles
    }
  }, [spawnConfetti, spawnSparkles])

  return (
    <div className="particle-container">
      {particles.map(particle => {
        const elapsed = Date.now() - particle.startTime
        const progress = elapsed / particle.lifetime

        if (particle.type === 'sparkle') {
          return (
            <div
              key={particle.id}
              className="particle particle-sparkle"
              style={{
                left: particle.x,
                top: particle.y,
                '--dx': `${particle.dx * progress}px`,
                '--dy': `${particle.dy * progress}px`,
              }}
            />
          )
        }

        if (particle.type === 'confetti') {
          const gravity = 980
          const y = particle.y + particle.vy * (elapsed / 1000) + 0.5 * gravity * Math.pow(elapsed / 1000, 2)
          const x = particle.x + particle.vx * (elapsed / 1000)

          return (
            <div
              key={particle.id}
              className="particle particle-confetti"
              style={{
                left: x,
                top: y,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation * progress}deg)`,
                opacity: 1 - progress,
              }}
            />
          )
        }

        return null
      })}
    </div>
  )
}
