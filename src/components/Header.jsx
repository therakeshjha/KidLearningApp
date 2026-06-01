import { logoutUser } from '../utils/storage'

export default function Header({ gameState, navigate }) {
  const { player } = gameState

  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
      logoutUser()
      window.location.reload()
    }
  }

  return (
    <header style={{
      background: 'rgba(0, 0, 0, 0.9)',
      boxShadow: '0 2px 20px rgba(255, 20, 147, 0.3)',
      borderBottom: '2px solid rgba(255, 20, 147, 0.3)'
    }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-3xl">🚀</div>
            <div className="font-extrabold text-2xl" style={{
              background: 'linear-gradient(90deg, #ff1493, #ffeb3b, #00ff87, #00ffff, #ff1493)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 100%',
              animation: 'gradient-shift 3s ease infinite'
            }}>
              Galactic Quest
            </div>
          </div>

          {/* Navigation menu */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: '#00ffff' }}>
            <button
              onClick={() => navigate('home')}
              className="transition-colors"
              style={{ color: '#00ffff' }}
              onMouseOver={(e) => e.target.style.color = '#ffeb3b'}
              onMouseOut={(e) => e.target.style.color = '#00ffff'}
            >
              Home
            </button>
            <button
              onClick={() => navigate('subjects')}
              className="transition-colors"
              style={{ color: '#00ffff' }}
              onMouseOver={(e) => e.target.style.color = '#ffeb3b'}
              onMouseOut={(e) => e.target.style.color = '#00ffff'}
            >
              Study
            </button>
            <button
              onClick={() => navigate('library')}
              className="transition-colors"
              style={{ color: '#00ffff' }}
              onMouseOver={(e) => e.target.style.color = '#ffeb3b'}
              onMouseOut={(e) => e.target.style.color = '#00ffff'}
            >
              Library
            </button>
            <button
              onClick={() => navigate('speedround')}
              className="transition-colors"
              style={{ color: '#00ffff' }}
              onMouseOver={(e) => e.target.style.color = '#ffeb3b'}
              onMouseOut={(e) => e.target.style.color = '#00ffff'}
            >
              Speed Round
            </button>
            <button
              onClick={() => navigate('achievements')}
              className="transition-colors"
              style={{ color: '#00ffff' }}
              onMouseOver={(e) => e.target.style.color = '#ffeb3b'}
              onMouseOut={(e) => e.target.style.color = '#00ffff'}
            >
              Achievements
            </button>
            <button
              onClick={() => navigate('shop')}
              className="transition-colors"
              style={{ color: '#00ffff' }}
              onMouseOver={(e) => e.target.style.color = '#ffeb3b'}
              onMouseOut={(e) => e.target.style.color = '#00ffff'}
            >
              Shop
            </button>
          </nav>

          {/* User info and actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full border-2" style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderColor: '#00ff87'
            }}>
              <span className="text-2xl">{player.avatar}</span>
              <div className="text-sm">
                <div className="font-semibold" style={{ color: '#ffeb3b' }}>{player.name}</div>
                <div className="text-xs" style={{ color: '#00ffff' }}>Level {player.level}</div>
              </div>
            </div>
            <button
              onClick={() => navigate('parent')}
              className="px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all"
              style={{
                color: '#ff1493',
                background: 'rgba(0, 0, 0, 0.5)',
                borderColor: '#ff1493'
              }}
            >
              Parent Portal
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all"
              style={{
                color: '#ff4444',
                background: 'rgba(0, 0, 0, 0.5)',
                borderColor: '#ff4444'
              }}
              title="Switch User"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden mt-3 pt-3" style={{ borderTop: '1px solid rgba(255, 20, 147, 0.3)' }}>
          <div className="flex items-center justify-center gap-4 mb-2">
            <button
              onClick={() => navigate('home')}
              className="text-xs font-medium transition-colors"
              style={{ color: '#00ffff' }}
            >
              Home
            </button>
            <button
              onClick={() => navigate('subjects')}
              className="text-xs font-medium transition-colors"
              style={{ color: '#00ffff' }}
            >
              Study
            </button>
            <button
              onClick={() => navigate('speedround')}
              className="text-xs font-medium transition-colors"
              style={{ color: '#00ffff' }}
            >
              Speed
            </button>
            <button
              onClick={() => navigate('achievements')}
              className="text-xs font-medium transition-colors"
              style={{ color: '#00ffff' }}
            >
              Awards
            </button>
            <button
              onClick={() => navigate('shop')}
              className="text-xs font-medium transition-colors"
              style={{ color: '#00ffff' }}
            >
              Shop
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255, 20, 147, 0.2)' }}>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border" style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderColor: '#00ff87'
            }}>
              <span className="text-lg">{player.avatar}</span>
              <div className="text-xs">
                <div className="font-semibold" style={{ color: '#ffeb3b' }}>{player.name}</div>
                <div style={{ color: '#00ffff', fontSize: '10px' }}>Level {player.level}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-xs font-semibold rounded-full border transition-all"
              style={{
                color: '#ff4444',
                background: 'rgba(0, 0, 0, 0.5)',
                borderColor: '#ff4444'
              }}
              title="Switch User"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
