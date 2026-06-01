import { useState, useEffect, useRef, useCallback } from 'react'

const ROWS = 20
const COLS = 10
const CELL_SIZE = 25
const GAME_SPEED = 800

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
}

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
}

export default function TetrisGame({ onBack }) {
  const [board, setBoard] = useState(() => Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
  const [currentPiece, setCurrentPiece] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [level, setLevel] = useState(1)

  const canvasRef = useRef(null)
  const gameSpeedRef = useRef(GAME_SPEED)

  const createNewPiece = useCallback(() => {
    const shapes = Object.keys(SHAPES)
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)]
    return {
      shape: SHAPES[randomShape],
      type: randomShape,
      color: COLORS[randomShape]
    }
  }, [])

  const checkCollision = useCallback((piece, pos, currentBoard) => {
    if (!piece) return true

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = pos.x + x
          const newY = pos.y + y

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true
          }

          if (newY >= 0 && currentBoard[newY][newX]) {
            return true
          }
        }
      }
    }
    return false
  }, [])

  const rotatePiece = useCallback((piece) => {
    const rotated = piece.shape[0].map((_, i) =>
      piece.shape.map(row => row[i]).reverse()
    )
    return { ...piece, shape: rotated }
  }, [])

  const mergePiece = useCallback((currentBoard, piece, pos) => {
    const newBoard = currentBoard.map(row => [...row])

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] && pos.y + y >= 0) {
          newBoard[pos.y + y][pos.x + x] = piece.color
        }
      }
    }

    return newBoard
  }, [])

  const clearLines = useCallback((currentBoard) => {
    let linesCleared = 0
    const newBoard = currentBoard.filter(row => {
      if (row.every(cell => cell !== null)) {
        linesCleared++
        return false
      }
      return true
    })

    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(null))
    }

    return { newBoard, linesCleared }
  }, [])

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
    const newPiece = createNewPiece()
    setCurrentPiece(newPiece)
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 })
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
    setGameStarted(true)
    gameSpeedRef.current = GAME_SPEED
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver || isPaused || !currentPiece) return

      e.preventDefault()

      if (e.key === 'ArrowLeft') {
        const newPos = { ...position, x: position.x - 1 }
        if (!checkCollision(currentPiece, newPos, board)) {
          setPosition(newPos)
        }
      } else if (e.key === 'ArrowRight') {
        const newPos = { ...position, x: position.x + 1 }
        if (!checkCollision(currentPiece, newPos, board)) {
          setPosition(newPos)
        }
      } else if (e.key === 'ArrowDown') {
        const newPos = { ...position, y: position.y + 1 }
        if (!checkCollision(currentPiece, newPos, board)) {
          setPosition(newPos)
          setScore(prev => prev + 1)
        }
      } else if (e.key === 'ArrowUp') {
        const rotated = rotatePiece(currentPiece)
        if (!checkCollision(rotated, position, board)) {
          setCurrentPiece(rotated)
        }
      } else if (e.key === ' ') {
        setIsPaused(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver, isPaused, currentPiece, position, board, checkCollision, rotatePiece])

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused || !currentPiece) return

    const gameLoop = setInterval(() => {
      const newPos = { ...position, y: position.y + 1 }

      if (checkCollision(currentPiece, newPos, board)) {
        const mergedBoard = mergePiece(board, currentPiece, position)
        const { newBoard, linesCleared } = clearLines(mergedBoard)

        if (linesCleared > 0) {
          setLines(prev => prev + linesCleared)
          setScore(prev => prev + linesCleared * 100 * level)

          const newLevel = Math.floor((lines + linesCleared) / 10) + 1
          if (newLevel > level) {
            setLevel(newLevel)
            gameSpeedRef.current = Math.max(100, GAME_SPEED - (newLevel - 1) * 100)
          }
        }

        setBoard(newBoard)
        const newPiece = createNewPiece()
        const startPos = { x: Math.floor(COLS / 2) - 1, y: 0 }

        if (checkCollision(newPiece, startPos, newBoard)) {
          setGameOver(true)
        } else {
          setCurrentPiece(newPiece)
          setPosition(startPos)
        }
      } else {
        setPosition(newPos)
      }
    }, gameSpeedRef.current)

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, isPaused, currentPiece, position, board, level, lines, checkCollision, mergePiece, clearLines, createNewPiece])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw board
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = cell
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
          ctx.strokeStyle = '#000'
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
        } else {
          ctx.fillStyle = '#0d1b2a'
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1)
        }
      })
    })

    // Draw current piece
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const drawX = (position.x + x) * CELL_SIZE
            const drawY = (position.y + y) * CELL_SIZE
            ctx.fillStyle = currentPiece.color
            ctx.fillRect(drawX, drawY, CELL_SIZE - 1, CELL_SIZE - 1)
            ctx.strokeStyle = '#000'
            ctx.strokeRect(drawX, drawY, CELL_SIZE - 1, CELL_SIZE - 1)
          }
        })
      })
    }

    // Draw grid lines
    ctx.strokeStyle = '#1a1a2e'
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(COLS * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, ROWS * CELL_SIZE)
      ctx.stroke()
    }
  }, [board, currentPiece, position])

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
            <h1 className="text-4xl font-bold text-white mb-2">🟦 Tetris</h1>
            <p className="text-blue-200">Arrow keys to move, Up to rotate</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200 font-semibold">SCORE</div>
            <div className="text-4xl font-bold text-yellow-300">{score}</div>
          </div>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <div className="bg-space-dark rounded-2xl p-4">
            <canvas
              ref={canvasRef}
              width={COLS * CELL_SIZE}
              height={ROWS * CELL_SIZE}
              className="border-2 border-cyan-500"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-space-navy rounded-xl p-4 w-32">
              <div className="text-xl mb-1">📊</div>
              <div className="text-xs text-blue-200 font-semibold">LEVEL</div>
              <div className="text-3xl font-bold text-white">{level}</div>
            </div>
            <div className="bg-space-navy rounded-xl p-4 w-32">
              <div className="text-xl mb-1">✨</div>
              <div className="text-xs text-blue-200 font-semibold">LINES</div>
              <div className="text-3xl font-bold text-white">{lines}</div>
            </div>
          </div>
        </div>

        {!gameStarted && (
          <div className="text-center mb-6">
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              🎮 Start Game
            </button>
          </div>
        )}

        {gameStarted && !gameOver && (
          <div className="text-center mb-6">
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
          </div>
        )}

        {gameOver && (
          <div className="text-center mb-6 bg-red-500/20 border-2 border-red-500 rounded-xl p-6">
            <div className="text-5xl mb-3">🎮</div>
            <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-xl text-blue-200 mb-1">Final Score: {score}</p>
            <p className="text-lg text-blue-200 mb-4">Lines Cleared: {lines}</p>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
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
      </div>
    </div>
  )
}
