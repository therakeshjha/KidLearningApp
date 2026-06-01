import { getXPProgress, getAccuracy, BADGES } from '../utils/gameLogic'
import { SUBJECT_META } from '../data/questions'
import { AnimatedCounter } from '../components/animations/AnimatedCounter'

export default function HomeScreen({ gameState, navigate }) {
  const { player, dailyQuest, sessions } = gameState
  const xpInfo = getXPProgress(player.xp)
  const questPct = dailyQuest.needed > 0
    ? Math.round((dailyQuest.completed / dailyQuest.needed) * 100) : 0
  const questMeta = SUBJECT_META[dailyQuest.subject]

  const recentSessions = [...sessions].reverse().slice(0, 3)

  return (
    <div className="slide-up">
      {/* Hero Section */}
      <div className="hero-section -mx-6 px-6 py-16 mb-8" style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a0a2e 50%, #16213e 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="text-5xl float">{player.avatar}</div>
              <div>
                <h1 className="text-4xl font-extrabold mb-2" style={{
                  background: 'linear-gradient(90deg, #ffeb3b, #ff1493, #00ff87)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Welcome back, {player.name}!
                </h1>
                <div className="text-lg font-semibold" style={{ color: '#00ffff' }}>
                  Level {player.level} Space Cadet
                  {player.grade && ` · ${player.grade}${['st', 'nd', 'rd', 'th', 'th'][player.grade - 1]} Grade`}
                  {player.streak > 0 ? ` · 🔥 ${player.streak} day streak!` : ' · Start your learning journey'}
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress Card */}
          <div className="p-6 rounded-2xl border-2" style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderColor: '#ff1493',
            boxShadow: '0 0 30px rgba(255, 20, 147, 0.3)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#ffeb3b' }}>Your Progress</div>
                <div className="text-3xl font-extrabold" style={{ color: '#00ff87' }}>
                  Level {player.level}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#ffeb3b' }}>Coins</div>
                <div className="text-3xl font-extrabold" style={{ color: '#00ff87' }}>
                  💰 <AnimatedCounter value={player.coins} />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${xpInfo.pct}%`,
                    background: 'linear-gradient(90deg, #ff1493, #00ffff, #00ff87)',
                    boxShadow: '0 0 20px rgba(0, 255, 135, 0.6)'
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm font-semibold" style={{ color: '#ffffff' }}>
                <span><AnimatedCounter value={xpInfo.current} /> / {xpInfo.needed} XP</span>
                <span>Next: Level {player.level + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto mt-8">
        {/* Daily Quest Card */}
        <div className={`p-6 mb-8 rounded-2xl border-2 ${dailyQuest.done ? 'opacity-70' : ''}`} style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: '#ffeb3b',
          boxShadow: dailyQuest.done ? 'none' : '0 0 30px rgba(255, 235, 59, 0.4)'
        }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: '#ffeb3b' }}>
                📋 Daily Quest {dailyQuest.done ? '✅' : ''}
              </div>
              <div className="text-xl font-bold mb-1" style={{ color: '#ff1493' }}>
                {questMeta.emoji} {questMeta.label.replace('Planet ', '').replace('World ', '').replace('Realm ', '')} Challenge
              </div>
              <div className="text-sm font-medium" style={{ color: '#00ffff' }}>
                Answer {dailyQuest.needed} {dailyQuest.subject} questions to earn rewards
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-extrabold" style={{ color: '#00ff87' }}>+{dailyQuest.xpReward} XP</div>
              <div className="text-base font-bold" style={{ color: '#ffeb3b' }}>+{dailyQuest.coinsReward} 💰</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 rounded-full overflow-hidden relative" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${questPct}%`,
                    background: 'linear-gradient(90deg, #ff1493, #ffeb3b)',
                    boxShadow: '0 0 15px rgba(255, 20, 147, 0.6)'
                  }}
                />
                {questPct > 0 && questPct < 100 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 text-lg"
                    style={{ left: `${questPct}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    🚀
                  </div>
                )}
              </div>
              <div className="text-xs font-medium mt-1.5" style={{ color: '#ffffff' }}>
                {dailyQuest.completed}/{dailyQuest.needed} questions completed
              </div>
            </div>
            {!dailyQuest.done && (
              <button
                onClick={() => navigate('quiz', { subject: dailyQuest.subject, isDailyQuest: true })}
                className="text-sm px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #ff1493, #00ffff)',
                  color: '#ffffff',
                  boxShadow: '0 4px 20px rgba(255, 20, 147, 0.4)'
                }}
              >
                Start Quest
              </button>
            )}
          </div>
        </div>

        {/* Learning Sections */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold mb-6" style={{
            background: 'linear-gradient(90deg, #ff1493, #00ffff, #ffeb3b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Start Learning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('subjects')}
              className="p-8 text-left group rounded-2xl border-2 transition-all hover:scale-105"
              aria-label="Go to study planets to choose a subject"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: '#ff1493',
                boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)'
              }}
            >
              <div className="text-5xl mb-4 group-hover:float">🪐</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#ff1493' }}>Study Planets</h3>
              <p className="text-sm font-medium" style={{ color: '#00ffff' }}>
                Explore 4 exciting subjects and master new skills
              </p>
            </button>

            <button
              onClick={() => navigate('library')}
              className="p-8 text-left group rounded-2xl border-2 transition-all hover:scale-105"
              aria-label="Visit galactic library to read stories"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: '#ffeb3b',
                boxShadow: '0 0 20px rgba(255, 235, 59, 0.3)'
              }}
            >
              <div className="text-5xl mb-4 group-hover:float">📚</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#ffeb3b' }}>Galactic Library</h3>
              <p className="text-sm font-medium" style={{ color: '#00ffff' }}>
                Read stories and answer comprehension questions
              </p>
            </button>

            <button
              onClick={() => navigate('speedround')}
              className="p-8 text-left group rounded-2xl border-2 transition-all hover:scale-105"
              aria-label="Start speed round challenge"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: '#00ff87',
                boxShadow: '0 0 20px rgba(0, 255, 135, 0.3)'
              }}
            >
              <div className="text-5xl mb-4 group-hover:float">⚡</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#00ff87' }}>Speed Round</h3>
              <p className="text-sm font-medium" style={{ color: '#00ffff' }}>
                60-second challenge · Test your quick thinking
              </p>
            </button>

            <button
              onClick={() => navigate('games')}
              className="p-8 text-left group rounded-2xl border-2 transition-all hover:scale-105"
              aria-label="Play fun arcade games"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: '#00ff87',
                boxShadow: '0 0 20px rgba(0, 255, 135, 0.3)'
              }}
            >
              <div className="text-5xl mb-4 group-hover:float">🎮</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#00ff87' }}>Game Arcade</h3>
              <p className="text-sm font-medium" style={{ color: '#00ffff' }}>
                Take a break with Snake, Tetris, and Chess
              </p>
            </button>

            <button
              onClick={() => navigate('achievements')}
              className="p-8 text-left group rounded-2xl border-2 transition-all hover:scale-105"
              aria-label="View your achievements and badges"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: '#00ffff',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
              }}
            >
              <div className="text-5xl mb-4 group-hover:float">🏆</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#00ffff' }}>Achievements</h3>
              <p className="text-sm font-medium" style={{ color: '#ffeb3b' }}>
                {player.badges.length} badges earned · View all awards
              </p>
            </button>

            <button
              onClick={() => navigate('shop')}
              className="p-8 text-left group rounded-2xl border-2 transition-all hover:scale-105"
              aria-label="Visit galactic shop to spend coins"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: '#ff4444',
                boxShadow: '0 0 20px rgba(255, 68, 68, 0.3)'
              }}
            >
              <div className="text-5xl mb-4 group-hover:float">🏪</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#ff4444' }}>Galactic Shop</h3>
              <p className="text-sm font-medium" style={{ color: '#00ffff' }}>
                {player.coins} coins available to customize your avatar
              </p>
            </button>

            <button
              onClick={() => navigate('subjects', { showStats: true })}
              className="p-8 text-left group rounded-2xl border-2 transition-all hover:scale-105"
              aria-label="Return to galaxy map"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: '#ff1493',
                boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)'
              }}
            >
              <div className="text-5xl mb-4 group-hover:float">📊</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: '#ff1493' }}>Galaxy Map</h3>
              <p className="text-sm font-medium" style={{ color: '#00ffff' }}>
                Track your progress across all subjects
              </p>
            </button>
          </div>
        </div>

        {/* Badges Section */}
        {player.badges.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-extrabold" style={{
                background: 'linear-gradient(90deg, #ffeb3b, #00ff87)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Your Achievements</h2>
              <button
                onClick={() => navigate('achievements')}
                className="font-semibold text-sm transition-colors flex items-center gap-1 hover:scale-105"
                style={{ color: '#00ffff' }}
              >
                View All →
              </button>
            </div>
            <div className="p-6 rounded-2xl border-2" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#00ff87',
              boxShadow: '0 0 20px rgba(0, 255, 135, 0.3)'
            }}>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {player.badges.map(bid => {
                  const b = BADGES[bid]
                  return b ? (
                    <button
                      key={bid}
                      onClick={() => navigate('achievements')}
                      className="flex-shrink-0 rounded-2xl p-6 flex flex-col items-center gap-3 border-2 hover:shadow-lg transition-all hover:-translate-y-1 min-w-[120px]"
                      title={b.desc}
                      style={{
                        background: 'rgba(255, 20, 147, 0.2)',
                        borderColor: '#ff1493',
                        boxShadow: '0 0 15px rgba(255, 20, 147, 0.3)'
                      }}
                    >
                      <div className="text-5xl">{b.emoji}</div>
                      <div className="text-sm font-semibold text-center" style={{ color: '#ffeb3b' }}>{b.label}</div>
                    </button>
                  ) : null
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold mb-6" style={{
              background: 'linear-gradient(90deg, #ff1493, #ffeb3b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Recent Activity</h2>
            <div className="p-6 rounded-2xl border-2" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#00ffff',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
            }}>
              <div className="space-y-4">
                {recentSessions.map((s, i) => {
                  const meta = SUBJECT_META[s.subject]
                  const acc = getAccuracy(s.total, s.correct)
                  const stars = Math.round((acc / 100) * 5)

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-5 rounded-xl border-l-4 hover:shadow-md transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderLeftColor: meta.accent
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">
                          {meta?.emoji}
                        </div>
                        <div>
                          <div className="font-semibold text-lg" style={{ color: '#ff1493' }}>
                            {meta?.label?.replace('Planet ', '').replace('World ', '').replace('Realm ', '')}
                          </div>
                          <div className="text-sm font-medium" style={{ color: '#00ffff' }}>{s.date}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx} className="text-lg" style={{ color: idx < stars ? '#ffeb3b' : 'rgba(255, 255, 255, 0.2)' }}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <div className="font-bold text-lg" style={{
                          color: acc >= 80 ? '#00ff87' : acc >= 60 ? '#ffeb3b' : '#ff4444'
                        }}>
                          {s.correct}/{s.total} ({acc}%)
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 flex justify-between text-sm" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
                <span className="font-semibold">Total Questions: <span style={{ color: '#00ffff' }}><AnimatedCounter value={player.totalAnswered} /></span></span>
                <span className="font-semibold">Overall Accuracy: <span style={{ color: '#00ffff' }}>{getAccuracy(player.totalAnswered, player.totalCorrect)}%</span></span>
              </div>
            </div>
          </div>
        )}

        {/* First-time Welcome */}
        {player.totalAnswered === 0 && (
          <div className="p-8 text-center border-2 rounded-2xl" style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderColor: '#ff1493',
            boxShadow: '0 0 30px rgba(255, 20, 147, 0.4)'
          }}>
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-3xl font-extrabold mb-3" style={{
              background: 'linear-gradient(90deg, #ff1493, #00ffff, #00ff87)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Welcome, Commander!</h3>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: '#ffffff' }}>
              Your mission: conquer 4 knowledge planets, earn Stardust (XP), and build the most
              powerful fleet in the galaxy. Start with your <span className="font-bold" style={{ color: '#ffeb3b' }}>Daily Quest</span> above
              or explore the <span className="font-bold" style={{ color: '#00ff87' }}>Study Planets</span>!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
