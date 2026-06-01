import { useState } from 'react'

export default function CheckersGame({ onBack }) {
  const [board, setBoard] = useState(initializeBoard())
  const [selectedPiece, setSelectedPiece] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [scores, setScores] = useState({ player: 12, computer: 12 })

  function initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null))

    // Place red pieces (player) on bottom 3 rows
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { type: 'red', king: false }
        }
      }
    }

    // Place black pieces (computer) on top 3 rows
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { type: 'black', king: false }
        }
      }
    }

    return board
  }

  function getValidMoves(row, col, boardState = board) {
    const piece = boardState[row][col]
    if (!piece) return []

    const moves = []
    const directions = piece.type === 'red'
      ? (piece.king ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : [[-1, -1], [-1, 1]])
      : (piece.king ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : [[1, -1], [1, 1]])

    // Check regular moves
    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        if (!boardState[newRow][newCol]) {
          moves.push({ row: newRow, col: newCol, capture: null })
        }
      }
    }

    // Check capture moves (can move 2 spaces if jumping over opponent)
    for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      const jumpRow = row + dr
      const jumpCol = col + dc
      const landRow = row + dr * 2
      const landCol = col + dc * 2

      if (landRow >= 0 && landRow < 8 && landCol >= 0 && landCol < 8) {
        const jumpPiece = boardState[jumpRow][jumpCol]
        if (jumpPiece && jumpPiece.type !== piece.type && !boardState[landRow][landCol]) {
          moves.push({
            row: landRow,
            col: landCol,
            capture: { row: jumpRow, col: jumpCol }
          })
        }
      }
    }

    return moves
  }

  function handleCellClick(row, col) {
    if (!isPlayerTurn || gameOver) return

    const piece = board[row][col]

    // Select a piece
    if (piece && piece.type === 'red' && !selectedPiece) {
      const moves = getValidMoves(row, col)
      setSelectedPiece({ row, col })
      setValidMoves(moves)
      return
    }

    // Move selected piece
    if (selectedPiece) {
      const move = validMoves.find(m => m.row === row && m.col === col)
      if (move) {
        movePiece(selectedPiece.row, selectedPiece.col, row, col, move.capture)
      }
      setSelectedPiece(null)
      setValidMoves([])
    }
  }

  function movePiece(fromRow, fromCol, toRow, toCol, capture) {
    const newBoard = board.map(row => [...row])
    const piece = newBoard[fromRow][fromCol]

    // Move piece
    newBoard[toRow][toCol] = piece
    newBoard[fromRow][fromCol] = null

    // Promote to king if reached opposite end
    if (piece.type === 'red' && toRow === 0) {
      newBoard[toRow][toCol].king = true
    } else if (piece.type === 'black' && toRow === 7) {
      newBoard[toRow][toCol].king = true
    }

    // Remove captured piece
    if (capture) {
      newBoard[capture.row][capture.col] = null
      updateScores(newBoard)
    }

    setBoard(newBoard)

    // Check for game over
    const playerPieces = countPieces(newBoard, 'red')
    const computerPieces = countPieces(newBoard, 'black')

    if (playerPieces === 0) {
      setGameOver(true)
      setWinner('computer')
      return
    }
    if (computerPieces === 0) {
      setGameOver(true)
      setWinner('player')
      return
    }

    // Switch turn
    if (isPlayerTurn) {
      setIsPlayerTurn(false)
      setTimeout(() => computerTurn(newBoard), 800)
    } else {
      setIsPlayerTurn(true)
    }
  }

  function computerTurn(currentBoard) {
    // Find all computer pieces and their valid moves
    const allMoves = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = currentBoard[row][col]
        if (piece && piece.type === 'black') {
          const moves = getValidMoves(row, col, currentBoard)
          moves.forEach(move => {
            allMoves.push({ from: { row, col }, to: move })
          })
        }
      }
    }

    if (allMoves.length === 0) {
      setGameOver(true)
      setWinner('player')
      return
    }

    // Prioritize captures
    const captureMoves = allMoves.filter(m => m.to.capture)
    const selectedMove = captureMoves.length > 0
      ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
      : allMoves[Math.floor(Math.random() * allMoves.length)]

    movePiece(
      selectedMove.from.row,
      selectedMove.from.col,
      selectedMove.to.row,
      selectedMove.to.col,
      selectedMove.to.capture
    )
  }

  function countPieces(boardState, type) {
    let count = 0
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (boardState[row][col]?.type === type) count++
      }
    }
    return count
  }

  function updateScores(boardState) {
    setScores({
      player: countPieces(boardState, 'red'),
      computer: countPieces(boardState, 'black')
    })
  }

  function resetGame() {
    setBoard(initializeBoard())
    setSelectedPiece(null)
    setValidMoves([])
    setIsPlayerTurn(true)
    setGameOver(false)
    setWinner(null)
    setScores({ player: 12, computer: 12 })
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
            <h1 className="text-4xl font-bold text-white mb-2">🔴 Checkers</h1>
            <p className="text-blue-200">You are Red, Computer is Black</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200 font-semibold">TURN</div>
            <div className="text-2xl font-bold text-yellow-300">
              {gameOver ? '🎮' : isPlayerTurn ? '🔴 You' : '⚫ Computer'}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center mb-6">
          <div className="bg-amber-900 p-2 rounded-2xl inline-block">
            <div className="grid grid-cols-8 gap-0">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const isLight = (rowIndex + colIndex) % 2 === 0
                  const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex
                  const isValidMove = validMoves.some(m => m.row === rowIndex && m.col === colIndex)

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`w-12 h-12 flex items-center justify-center text-3xl transition-all ${
                        isLight ? 'bg-amber-200' : 'bg-amber-800'
                      } ${
                        isSelected ? 'ring-4 ring-yellow-400' : ''
                      } ${
                        isValidMove ? 'ring-4 ring-green-400 cursor-pointer' : ''
                      } ${
                        cell && isPlayerTurn && cell.type === 'red' && !selectedPiece
                          ? 'cursor-pointer hover:ring-2 hover:ring-blue-400'
                          : ''
                      }`}
                      disabled={gameOver || !isPlayerTurn}
                    >
                      {cell && (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          cell.type === 'red'
                            ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-lg'
                            : 'bg-gradient-to-br from-gray-800 to-black shadow-lg'
                        }`}>
                          {cell.king && <span className="text-yellow-300">👑</span>}
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Game Status */}
        {gameOver && (
          <div className={`text-center mb-6 rounded-xl p-6 border-2 ${
            winner === 'player' ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'
          }`}>
            <div className="text-5xl mb-3">
              {winner === 'player' ? '🎉' : '🤖'}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {winner === 'player' ? 'You Win!' : 'Computer Wins!'}
            </h2>
            <button
              onClick={resetGame}
              className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 Play Again
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-space-navy rounded-xl p-4 mb-6">
          <h3 className="text-white font-bold mb-2">📋 How to Play:</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Click a red piece to select it</li>
            <li>• Click a highlighted square to move</li>
            <li>• Jump over black pieces to capture them</li>
            <li>• Reach the top to become a King! 👑</li>
          </ul>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4">
            <div className="text-2xl mb-2">🔴</div>
            <div className="text-sm text-blue-200 font-semibold">Your Pieces</div>
            <div className="text-3xl font-bold text-white">{scores.player}</div>
          </div>
          <div className="bg-gray-500/20 border-2 border-gray-500 rounded-xl p-4">
            <div className="text-2xl mb-2">⚫</div>
            <div className="text-sm text-blue-200 font-semibold">Computer Pieces</div>
            <div className="text-3xl font-bold text-white">{scores.computer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
