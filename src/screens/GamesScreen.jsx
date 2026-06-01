import { useState } from 'react'
import SnakeGame from '../components/games/SnakeGame'
import TetrisGame from '../components/games/TetrisGame'
import ChessGame from '../components/games/ChessGame'
import TicTacToeGame from '../components/games/TicTacToeGame'
import CheckersGame from '../components/games/CheckersGame'

export default function GamesScreen({ navigate }) {
  const [selectedGame, setSelectedGame] = useState(null)

  const games = [
    {
      id: 'snake',
      name: 'Snake',
      emoji: '🐍',
      description: 'Classic snake game - eat food and grow longer!',
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'tetris',
      name: 'Tetris',
      emoji: '🟦',
      description: 'Stack blocks and clear lines!',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'chess',
      name: 'Chess',
      emoji: '♟️',
      description: 'Challenge the computer in chess!',
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      emoji: '⭕',
      description: 'Get three in a row to win!',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      id: 'checkers',
      name: 'Checkers',
      emoji: '🔴',
      description: 'Jump over pieces and become a king!',
      color: 'from-red-500 to-rose-600',
    },
  ]

  if (selectedGame === 'snake') {
    return <SnakeGame onBack={() => setSelectedGame(null)} />
  }

  if (selectedGame === 'tetris') {
    return <TetrisGame onBack={() => setSelectedGame(null)} />
  }

  if (selectedGame === 'chess') {
    return <ChessGame onBack={() => setSelectedGame(null)} />
  }

  if (selectedGame === 'tictactoe') {
    return <TicTacToeGame onBack={() => setSelectedGame(null)} />
  }

  if (selectedGame === 'checkers') {
    return <CheckersGame onBack={() => setSelectedGame(null)} />
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('home')}
          className="text-blue-300 hover:text-white transition-colors mb-4 flex items-center gap-2"
        >
          ← Back to Home
        </button>
        <h1 className="text-5xl font-extrabold text-white mb-3">
          🎮 Game Arcade
        </h1>
        <p className="text-xl text-blue-200">
          Take a break and play some classic games!
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            className={`bg-gradient-to-br ${game.color} rounded-3xl p-8 text-white text-left group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl`}
          >
            <div className="text-7xl mb-4 transition-transform group-hover:scale-110">
              {game.emoji}
            </div>
            <h2 className="text-3xl font-bold mb-3">{game.name}</h2>
            <p className="text-white/90 text-lg leading-relaxed">
              {game.description}
            </p>
            <div className="mt-6 flex items-center gap-2 text-white/80 font-semibold">
              <span>Play Now</span>
              <span className="transition-transform group-hover:translate-x-2">→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-12 bg-black/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-pink-500/30">
        <h3 className="text-2xl font-bold text-white mb-4">🎯 Game Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-blue-100">
          <div>
            <div className="text-3xl mb-2">🐍</div>
            <h4 className="font-bold text-white mb-2">Snake</h4>
            <p className="text-sm">Use arrow keys to move. Eat food to grow. Don't hit walls or yourself!</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🟦</div>
            <h4 className="font-bold text-white mb-2">Tetris</h4>
            <p className="text-sm">Arrow keys to move, Up to rotate. Clear lines to score!</p>
          </div>
          <div>
            <div className="text-3xl mb-2">♟️</div>
            <h4 className="font-bold text-white mb-2">Chess</h4>
            <p className="text-sm">Click pieces to move. Challenge the AI and plan your strategy!</p>
          </div>
          <div>
            <div className="text-3xl mb-2">⭕</div>
            <h4 className="font-bold text-white mb-2">Tic Tac Toe</h4>
            <p className="text-sm">Get three in a row! You're X, computer is O. Click to place your mark!</p>
          </div>
          <div>
            <div className="text-3xl mb-2">🔴</div>
            <h4 className="font-bold text-white mb-2">Checkers</h4>
            <p className="text-sm">Jump over opponent pieces to capture them. Reach the end to become a king!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
