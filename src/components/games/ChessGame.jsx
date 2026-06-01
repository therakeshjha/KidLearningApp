import { useState, useEffect, useCallback } from 'react'

const BOARD_SIZE = 8
const INITIAL_BOARD = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
]

const PIECE_VALUES = {
  '♟': 1, '♙': 1,
  '♞': 3, '♘': 3,
  '♝': 3, '♗': 3,
  '♜': 5, '♖': 5,
  '♛': 9, '♕': 9,
  '♚': 100, '♔': 100
}

export default function ChessGame({ onBack }) {
  const [board, setBoard] = useState(INITIAL_BOARD)
  const [selectedSquare, setSelectedSquare] = useState(null)
  const [validMoves, setValidMoves] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState('white')
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] })
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState(null)
  const [moveCount, setMoveCount] = useState(0)

  const isWhitePiece = (piece) => {
    return piece && ['♙', '♖', '♘', '♗', '♕', '♔'].includes(piece)
  }

  const isBlackPiece = (piece) => {
    return piece && ['♟', '♜', '♞', '♝', '♛', '♚'].includes(piece)
  }

  const isValidSquare = (row, col) => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
  }

  const getPawnMoves = useCallback((row, col, piece, currentBoard) => {
    const moves = []
    const direction = isWhitePiece(piece) ? -1 : 1
    const startRow = isWhitePiece(piece) ? 6 : 1

    // Move forward one square
    if (isValidSquare(row + direction, col) && !currentBoard[row + direction][col]) {
      moves.push([row + direction, col])

      // Move forward two squares from starting position
      if (row === startRow && !currentBoard[row + 2 * direction][col]) {
        moves.push([row + 2 * direction, col])
      }
    }

    // Capture diagonally
    const captureCols = [col - 1, col + 1]
    captureCols.forEach(captureCol => {
      if (isValidSquare(row + direction, captureCol)) {
        const target = currentBoard[row + direction][captureCol]
        if (target && ((isWhitePiece(piece) && isBlackPiece(target)) ||
                       (isBlackPiece(piece) && isWhitePiece(target)))) {
          moves.push([row + direction, captureCol])
        }
      }
    })

    return moves
  }, [])

  const getRookMoves = useCallback((row, col, piece, currentBoard) => {
    const moves = []
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]

    directions.forEach(([dRow, dCol]) => {
      let newRow = row + dRow
      let newCol = col + dCol

      while (isValidSquare(newRow, newCol)) {
        const target = currentBoard[newRow][newCol]
        if (!target) {
          moves.push([newRow, newCol])
        } else {
          if ((isWhitePiece(piece) && isBlackPiece(target)) ||
              (isBlackPiece(piece) && isWhitePiece(target))) {
            moves.push([newRow, newCol])
          }
          break
        }
        newRow += dRow
        newCol += dCol
      }
    })

    return moves
  }, [])

  const getKnightMoves = useCallback((row, col, piece, currentBoard) => {
    const moves = []
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ]

    knightMoves.forEach(([dRow, dCol]) => {
      const newRow = row + dRow
      const newCol = col + dCol

      if (isValidSquare(newRow, newCol)) {
        const target = currentBoard[newRow][newCol]
        if (!target || (isWhitePiece(piece) && isBlackPiece(target)) ||
            (isBlackPiece(piece) && isWhitePiece(target))) {
          moves.push([newRow, newCol])
        }
      }
    })

    return moves
  }, [])

  const getBishopMoves = useCallback((row, col, piece, currentBoard) => {
    const moves = []
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]

    directions.forEach(([dRow, dCol]) => {
      let newRow = row + dRow
      let newCol = col + dCol

      while (isValidSquare(newRow, newCol)) {
        const target = currentBoard[newRow][newCol]
        if (!target) {
          moves.push([newRow, newCol])
        } else {
          if ((isWhitePiece(piece) && isBlackPiece(target)) ||
              (isBlackPiece(piece) && isWhitePiece(target))) {
            moves.push([newRow, newCol])
          }
          break
        }
        newRow += dRow
        newCol += dCol
      }
    })

    return moves
  }, [])

  const getQueenMoves = useCallback((row, col, piece, currentBoard) => {
    return [...getRookMoves(row, col, piece, currentBoard), ...getBishopMoves(row, col, piece, currentBoard)]
  }, [getRookMoves, getBishopMoves])

  const getKingMoves = useCallback((row, col, piece, currentBoard) => {
    const moves = []
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ]

    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow
      const newCol = col + dCol

      if (isValidSquare(newRow, newCol)) {
        const target = currentBoard[newRow][newCol]
        if (!target || (isWhitePiece(piece) && isBlackPiece(target)) ||
            (isBlackPiece(piece) && isWhitePiece(target))) {
          moves.push([newRow, newCol])
        }
      }
    })

    return moves
  }, [])

  const getValidMoves = useCallback((row, col, currentBoard) => {
    const piece = currentBoard[row][col]
    if (!piece) return []

    if (piece === '♟' || piece === '♙') return getPawnMoves(row, col, piece, currentBoard)
    if (piece === '♜' || piece === '♖') return getRookMoves(row, col, piece, currentBoard)
    if (piece === '♞' || piece === '♘') return getKnightMoves(row, col, piece, currentBoard)
    if (piece === '♝' || piece === '♗') return getBishopMoves(row, col, piece, currentBoard)
    if (piece === '♛' || piece === '♕') return getQueenMoves(row, col, piece, currentBoard)
    if (piece === '♚' || piece === '♔') return getKingMoves(row, col, piece, currentBoard)

    return []
  }, [getPawnMoves, getRookMoves, getKnightMoves, getBishopMoves, getQueenMoves, getKingMoves])

  const getAllValidMoves = useCallback((player, currentBoard) => {
    const moves = []
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = currentBoard[row][col]
        if ((player === 'white' && isWhitePiece(piece)) ||
            (player === 'black' && isBlackPiece(piece))) {
          const pieceMoves = getValidMoves(row, col, currentBoard)
          pieceMoves.forEach(([toRow, toCol]) => {
            moves.push({ from: [row, col], to: [toRow, toCol] })
          })
        }
      }
    }
    return moves
  }, [getValidMoves])

  const makeComputerMove = useCallback(() => {
    const allMoves = getAllValidMoves('black', board)

    if (allMoves.length === 0) {
      setGameOver(true)
      setWinner('white')
      return
    }

    // Simple AI: prioritize captures, then random move
    const captureMoves = allMoves.filter(move => {
      const [toRow, toCol] = move.to
      return board[toRow][toCol] !== null
    })

    const selectedMove = captureMoves.length > 0
      ? captureMoves[Math.floor(Math.random() * captureMoves.length)]
      : allMoves[Math.floor(Math.random() * allMoves.length)]

    const [fromRow, fromCol] = selectedMove.from
    const [toRow, toCol] = selectedMove.to

    const newBoard = board.map(row => [...row])
    const capturedPiece = newBoard[toRow][toCol]

    if (capturedPiece) {
      setCapturedPieces(prev => ({
        ...prev,
        black: [...prev.black, capturedPiece]
      }))

      if (capturedPiece === '♔') {
        setGameOver(true)
        setWinner('black')
      }
    }

    newBoard[toRow][toCol] = newBoard[fromRow][fromCol]
    newBoard[fromRow][fromCol] = null

    setBoard(newBoard)
    setCurrentPlayer('white')
    setMoveCount(prev => prev + 1)
  }, [board, getAllValidMoves])

  const handleSquareClick = (row, col) => {
    if (gameOver || currentPlayer !== 'white') return

    const piece = board[row][col]

    if (selectedSquare) {
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col)

      if (isValidMove) {
        const [fromRow, fromCol] = selectedSquare
        const newBoard = board.map(row => [...row])
        const capturedPiece = newBoard[row][col]

        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            white: [...prev.white, capturedPiece]
          }))

          if (capturedPiece === '♚') {
            setGameOver(true)
            setWinner('white')
          }
        }

        newBoard[row][col] = newBoard[fromRow][fromCol]
        newBoard[fromRow][fromCol] = null

        setBoard(newBoard)
        setSelectedSquare(null)
        setValidMoves([])
        setCurrentPlayer('black')
        setMoveCount(prev => prev + 1)
      } else if (piece && isWhitePiece(piece)) {
        const moves = getValidMoves(row, col, board)
        setSelectedSquare([row, col])
        setValidMoves(moves)
      } else {
        setSelectedSquare(null)
        setValidMoves([])
      }
    } else if (piece && isWhitePiece(piece)) {
      const moves = getValidMoves(row, col, board)
      setSelectedSquare([row, col])
      setValidMoves(moves)
    }
  }

  useEffect(() => {
    if (currentPlayer === 'black' && !gameOver) {
      const timeout = setTimeout(() => {
        makeComputerMove()
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [currentPlayer, gameOver, makeComputerMove])

  const resetGame = () => {
    setBoard(INITIAL_BOARD)
    setSelectedSquare(null)
    setValidMoves([])
    setCurrentPlayer('white')
    setCapturedPieces({ white: [], black: [] })
    setGameOver(false)
    setWinner(null)
    setMoveCount(0)
  }

  const calculateScore = (pieces) => {
    return pieces.reduce((sum, piece) => sum + (PIECE_VALUES[piece] || 0), 0)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="text-blue-300 hover:text-white transition-colors mb-4 flex items-center gap-2"
      >
        ← Back to Games
      </button>

      <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-pink-500/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">♟️ Chess</h1>
            <p className="text-blue-200">Click a piece to see valid moves</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200 font-semibold">MOVE</div>
            <div className="text-4xl font-bold text-yellow-300">{moveCount}</div>
          </div>
        </div>

        <div className="flex justify-center gap-6 mb-6">
          {/* Captured by White */}
          <div className="bg-space-navy rounded-xl p-4 w-32">
            <div className="text-xs text-blue-200 font-semibold mb-2">CAPTURED</div>
            <div className="text-2xl mb-2">
              {capturedPieces.white.map((piece, i) => (
                <span key={i} className="text-red-600">{piece}</span>
              ))}
            </div>
            <div className="text-sm text-white font-bold">
              +{calculateScore(capturedPieces.white)}
            </div>
          </div>

          {/* Chess Board */}
          <div className="bg-space-dark p-4 rounded-2xl">
            <div className="grid grid-cols-8 gap-0 border-4 border-gray-700">
              {board.map((row, rowIndex) =>
                row.map((piece, colIndex) => {
                  const isLight = (rowIndex + colIndex) % 2 === 0
                  const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex
                  const isValidMove = validMoves.some(([r, c]) => r === rowIndex && c === colIndex)

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                      className={`w-14 h-14 flex items-center justify-center text-4xl cursor-pointer transition-all
                        ${isLight ? 'bg-gray-700' : 'bg-black'}
                        ${isSelected ? 'ring-4 ring-blue-400' : ''}
                        ${isValidMove ? 'bg-green-400' : ''}
                        hover:opacity-80`}
                    >
                      {piece && (
                        <span className={isWhitePiece(piece) ? 'text-cyan-400' : 'text-pink-500'}>
                          {piece}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Captured by Black */}
          <div className="bg-space-navy rounded-xl p-4 w-32">
            <div className="text-xs text-blue-200 font-semibold mb-2">COMPUTER</div>
            <div className="text-2xl mb-2">
              {capturedPieces.black.map((piece, i) => (
                <span key={i} className="text-blue-600">{piece}</span>
              ))}
            </div>
            <div className="text-sm text-white font-bold">
              +{calculateScore(capturedPieces.black)}
            </div>
          </div>
        </div>

        {/* Turn Indicator */}
        {!gameOver && (
          <div className="text-center mb-4 bg-blue-500/20 border-2 border-blue-500 rounded-xl p-4">
            <p className="text-xl font-bold text-white">
              {currentPlayer === 'white' ? '🔵 Your Turn (Blue)' : '🔴 Computer Thinking... (Red)'}
            </p>
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div className="text-center mb-4 bg-green-500/20 border-2 border-green-500 rounded-xl p-6">
            <div className="text-5xl mb-3">{winner === 'white' ? '🏆' : '🤖'}</div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {winner === 'white' ? '🔵 Blue Wins!' : '🔴 Red Wins!'}
            </h2>
            <p className="text-lg text-blue-200 mb-1">{winner === 'white' ? 'You Win!' : 'Computer Wins!'}</p>
            <p className="text-lg text-blue-200 mb-4">Moves: {moveCount}</p>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🔄 Play Again
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-space-navy rounded-xl p-4 text-center">
          <p className="text-blue-200 text-sm">
            💡 Click your blue pieces at the bottom to move. Green squares show valid moves!
          </p>
        </div>
      </div>
    </div>
  )
}
