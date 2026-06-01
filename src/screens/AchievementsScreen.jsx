import { BADGES } from '../utils/gameLogic'

export default function AchievementsScreen({ gameState, navigate }) {
  const { player } = gameState

  const allBadges = Object.keys(BADGES).map(key => ({
    id: key,
    ...BADGES[key],
    earned: player.badges.includes(key)
  }))

  const earnedCount = allBadges.filter(b => b.earned).length
  const totalCount = allBadges.length

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('home')}
          className="text-blue-300 hover:text-white transition-colors mb-4 flex items-center gap-2"
        >
          ← Back to Home
        </button>
        <h1 className="text-5xl font-extrabold text-white mb-3">
          🏆 Your Achievements
        </h1>
        <p className="text-xl text-blue-200">
          {earnedCount} of {totalCount} badges earned
        </p>

        {/* Progress Bar */}
        <div className="mt-4 bg-space-navy rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allBadges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-3xl p-6 border-2 transition-all ${
              badge.earned
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400 shadow-lg'
                : 'bg-black/20 border-pink-500/20 opacity-50'
            }`}
          >
            <div className="text-center">
              {/* Badge Icon */}
              <div
                className={`text-7xl mb-4 ${
                  badge.earned ? 'glow-pulse' : 'grayscale opacity-40'
                }`}
                style={
                  badge.earned
                    ? { '--glow-color': 'rgba(102, 126, 234, 0.4)' }
                    : {}
                }
              >
                {badge.emoji}
              </div>

              {/* Badge Name */}
              <h3 className="text-lg font-bold text-white mb-2">
                {badge.label}
              </h3>

              {/* Badge Description */}
              <p className="text-sm text-blue-200 leading-relaxed">
                {badge.desc}
              </p>

              {/* Status Indicator */}
              <div className="mt-4">
                {badge.earned ? (
                  <div className="inline-flex items-center gap-1 bg-green-500/20 border border-green-400 rounded-full px-3 py-1 text-xs font-bold text-green-300">
                    ✓ Earned
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-black/20 border border-pink-500/20 rounded-full px-3 py-1 text-xs font-bold text-gray-400">
                    🔒 Locked
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Message */}
      {earnedCount < totalCount && (
        <div className="mt-12 bg-black/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-pink-500/30 text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Keep Going, Space Explorer!
          </h2>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            You have {totalCount - earnedCount} more badge{totalCount - earnedCount !== 1 ? 's' : ''} to unlock.
            Keep learning and exploring the galaxy to earn them all!
          </p>
        </div>
      )}

      {/* All Badges Earned */}
      {earnedCount === totalCount && (
        <div className="mt-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 rounded-3xl p-8 text-center">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Master Space Explorer!
          </h2>
          <p className="text-yellow-200 text-xl max-w-2xl mx-auto">
            Incredible! You've earned all {totalCount} badges! You're a true champion of the galaxy! 🚀✨
          </p>
        </div>
      )}
    </div>
  )
}
