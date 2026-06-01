import { useState } from 'react'

export default function TicTacToeGame({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [winningLine, setWinningLine] = useState([])
  const [scores, setScores] = useState({ player: 0, computer: 0, draws: 0 })

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ]

  const checkWinner = (currentBoard) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo }
      }
    }
    if (currentBoard.every(cell => cell !== null)) {
      return { winner: 'draw', line: [] }
    }
    return null
  }

  const computerMove = (currentBoard) => {
    // Simple AI: Try to win, then block, then random
    const availableMoves = currentBoard.map((cell, idx) => cell === null ? idx : null).filter(idx => idx !== null)

    // Try to win
    for (const move of availableMoves) {
      const testBoard = [...currentBoard]
      testBoard[move] = 'O'
      if (checkWinner(testBoard)?.winner === 'O') {
        return move
      }
    }

    // Try to block player
    for (const move of availableMoves) {
      const testBoard = [...currentBoard]
      testBoard[move] = 'X'
      if (checkWinner(testBoard)?.winner === 'X') {
        return move
      }
    }

    // Take center if available
    if (availableMoves.includes(4)) return 4

    // Take corners
    const corners = [0, 2, 6, 8].filter(i => availableMoves.includes(i))
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)]

    // Random move
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  const handleCellClick = (index) => {
    if (!isPlayerTurn || board[index] || gameOver) return

    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)

    const result = checkWinner(newBoard)
    if (result) {
      handleGameEnd(result, newBoard)
      return
    }

    setIsPlayerTurn(false)

    // Computer move after delay
    setTimeout(() => {
      const computerMoveIndex = computerMove(newBoard)
      const finalBoard = [...newBoard]
      finalBoard[computerMoveIndex] = 'O'
      setBoard(finalBoard)

      const finalResult = checkWinner(finalBoard)
      if (finalResult) {
        handleGameEnd(finalResult, finalBoard)
      } else {
        setIsPlayerTurn(true)
      }
    }, 500)
  }

  const handleGameEnd = (result, finalBoard) => {
    setGameOver(true)
    setWinner(result.winner)
    setWinningLine(result.line)

    setScores(prev => ({
      player: result.winner === 'X' ? prev.player + 1 : prev.player,
      computer: result.winner === 'O' ? prev.computer + 1 : prev.computer,
      draws: result.winner === 'draw' ? prev.draws + 1 : prev.draws
    }))
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setGameOver(false)
    setWinner(null)
    setWinningLine([])
  }

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
            <h1 className="text-4xl font-bold text-white mb-2">⭕ Tic Tac Toe</h1>
            <p className="text-blue-200">You are X, Computer is O</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200 font-semibold">TURN</div>
            <div className="text-2xl font-bold text-yellow-300">
              {gameOver ? '🎮' : isPlayerTurn ? '❌ You' : '⭕ Computer'}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-3 gap-3 bg-space-dark p-6 rounded-2xl">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!isPlayerTurn || gameOver || cell !== null}
                className={`w-24 h-24 rounded-xl font-bold text-5xl transition-all transform hover:scale-105 ${
                  winningLine.includes(index)
                    ? 'bg-yellow-500 text-white'
                    : cell === 'X'
                    ? 'bg-blue-500 text-white'
                    : cell === 'O'
                    ? 'bg-red-500 text-white'
                    : 'bg-space-navy hover:bg-blue-900/50 text-white/30'
                } ${
                  !cell && !gameOver && isPlayerTurn ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Game Status */}
        {gameOver && (
          <div className={`text-center mb-6 rounded-xl p-6 border-2 ${
            winner === 'X' ? 'bg-green-500/20 border-green-500' :
            winner === 'O' ? 'bg-red-500/20 border-red-500' :
            'bg-yellow-500/20 border-yellow-500'
          }`}>
            <div className="text-5xl mb-3">
              {winner === 'X' ? '🎉' : winner === 'O' ? '🤖' : '🤝'}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {winner === 'X' ? 'You Win!' : winner === 'O' ? 'Computer Wins!' : "It's a Draw!"}
            </h2>
            <button
              onClick={resetGame}
              className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 Play Again
            </button>
          </div>
        )}

        {/* Scores */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-500/20 border-2 border-blue-500 rounded-xl p-4">
            <div className="text-2xl mb-2">❌</div>
            <div className="text-sm text-blue-200 font-semibold">You</div>
            <div className="text-3xl font-bold text-white">{scores.player}</div>
          </div>
          <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4">
            <div className="text-2xl mb-2">🤝</div>
            <div className="text-sm text-blue-200 font-semibold">Draws</div>
            <div className="text-3xl font-bold text-white">{scores.draws}</div>
          </div>
          <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4">
            <div className="text-2xl mb-2">⭕</div>
            <div className="text-sm text-blue-200 font-semibold">Computer</div>
            <div className="text-3xl font-bold text-white">{scores.computer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
