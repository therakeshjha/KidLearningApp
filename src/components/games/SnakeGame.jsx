import { useState, useEffect, useRef, useCallback } from 'react'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const GAME_SPEED = 400

export default function SnakeGame({ onBack }) {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState({ x: 15, y: 15 })
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const directionRef = useRef(direction)
  const canvasRef = useRef(null)

  const generateFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [snake])

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(generateFood())
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setGameOver(false)
    setScore(0)
    setIsPaused(false)
    setGameStarted(true)
  }

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver || isPaused) return

      const key = e.key
      const currentDir = directionRef.current

      if (key === 'ArrowUp' && currentDir.y === 0) {
        setDirection({ x: 0, y: -1 })
      } else if (key === 'ArrowDown' && currentDir.y === 0) {
        setDirection({ x: 0, y: 1 })
      } else if (key === 'ArrowLeft' && currentDir.x === 0) {
        setDirection({ x: -1, y: 0 })
      } else if (key === 'ArrowRight' && currentDir.x === 0) {
        setDirection({ x: 1, y: 0 })
      } else if (key === ' ') {
        e.preventDefault()
        setIsPaused(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver, isPaused])

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0]
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y
        }

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true)
          return prevSnake
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true)
          return prevSnake
        }

        const newSnake = [newHead, ...prevSnake]

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(prev => prev + 10)
          setFood(generateFood())
          return newSnake
        }

        newSnake.pop()
        return newSnake
      })
    }, GAME_SPEED)

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, isPaused, food, generateFood])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#1a1a2e'
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#10b981' : '#34d399'
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2)
      ctx.strokeStyle = '#059669'
      ctx.strokeRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2)
    })

    // Draw food
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }, [snake, food])

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="text-blue-300 hover:text-white transition-colors mb-4 flex items-center gap-2"
      >
        ← Back to Games
      </button>

      <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-pink-500/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🐍 Snake Game</h1>
            <p className="text-blue-200">Use arrow keys to move</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200 font-semibold">SCORE</div>
            <div className="text-4xl font-bold text-yellow-300">{score}</div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-space-dark rounded-2xl p-4 inline-block">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="border-2 border-blue-500"
            />
          </div>
        </div>

        {!gameStarted && (
          <div className="text-center mb-6">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              🎮 Start Game
            </button>
          </div>
        )}

        {gameStarted && !gameOver && (
          <div className="text-center mb-6">
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
          </div>
        )}

        {gameOver && (
          <div className="text-center mb-6 bg-red-500/20 border-2 border-red-500 rounded-xl p-6">
            <div className="text-5xl mb-3">💀</div>
            <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-xl text-blue-200 mb-4">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 Play Again
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="text-center bg-blue-500/20 border-2 border-blue-500 rounded-xl p-4 mb-6">
            <p className="text-xl font-bold text-white">⏸️ Paused</p>
            <p className="text-blue-200">Press Space or click Resume to continue</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-space-navy rounded-xl p-4">
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm text-blue-200 font-semibold">Length</div>
            <div className="text-2xl font-bold text-white">{snake.length}</div>
          </div>
          <div className="bg-space-navy rounded-xl p-4">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-sm text-blue-200 font-semibold">High Score</div>
            <div className="text-2xl font-bold text-white">{Math.max(score, 0)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
