import { useState } from 'react'
import { registerUser, loginUser, getAllUsers } from '../utils/storage'

export default function WelcomeScreen({ onUserLoggedIn }) {
  const [mode, setMode] = useState('choose') // 'choose', 'login', 'register'
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const allUsers = getAllUsers()

  // Floating space elements for background animation
  const floatingElements = [
    { emoji: '🪐', delay: 0, duration: 20, size: 'text-6xl', left: '10%', top: '15%' },
    { emoji: '⭐', delay: 2, duration: 15, size: 'text-4xl', left: '85%', top: '20%' },
    { emoji: '🌙', delay: 1, duration: 25, size: 'text-5xl', left: '5%', top: '70%' },
    { emoji: '✨', delay: 3, duration: 12, size: 'text-3xl', left: '90%', top: '75%' },
    { emoji: '☄️', delay: 1.5, duration: 18, size: 'text-4xl', left: '75%', top: '10%' },
    { emoji: '🌟', delay: 2.5, duration: 22, size: 'text-3xl', left: '15%', top: '85%' },
  ]

  function handleRegister() {
    setError('')
    setLoading(true)

    const result = registerUser(username)
    if (result.success) {
      loginUser(username)
      onUserLoggedIn()
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  function handleLogin() {
    setError('')
    setLoading(true)

    const result = loginUser(username)
    if (result.success) {
      onUserLoggedIn()
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  function handleQuickLogin(user) {
    setError('')
    setLoading(true)
    loginUser(user)
    onUserLoggedIn()
  }

  if (mode === 'choose') {
    return (
      <>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-15px) translateX(10px); }
            75% { transform: translateY(15px) translateX(-10px); }
          }
          @keyframes pulse-glow {
            0%, 100% { text-shadow: 0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.4); }
            50% { text-shadow: 0 0 30px rgba(251, 191, 36, 1), 0 0 60px rgba(251, 191, 36, 0.6); }
          }
          @keyframes shooting-star {
            0% { transform: translateX(-100px) translateY(-100px); opacity: 1; }
            100% { transform: translateX(1000px) translateY(1000px); opacity: 0; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes rocket-float {
            0%, 100% { transform: translateY(0px) rotate(-10deg); }
            50% { transform: translateY(-30px) rotate(10deg); }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          @keyframes spaceship-drift {
            0%, 100% { transform: translate(-50%, -50%) translateX(0px) translateY(0px) rotate(-15deg); }
            50% { transform: translate(-50%, -50%) translateX(30px) translateY(-20px) rotate(-12deg); }
          }
          @keyframes engine-glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          .float { animation: float var(--duration, 20s) ease-in-out infinite; }
          .float-slow { animation: floatSlow var(--duration, 25s) ease-in-out infinite; }
          .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
          .shooting-star { animation: shooting-star 3s linear infinite; }
          .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
          .rocket-float { animation: rocket-float 3s ease-in-out infinite; }
          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            background-size: 1000px 100%;
            animation: shimmer 3s infinite;
          }
          .spaceship-watermark {
            animation: spaceship-drift 15s ease-in-out infinite;
          }
          .engine-glow {
            animation: engine-glow 2s ease-in-out infinite;
          }
        `}</style>

        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4 relative overflow-hidden">
          {/* Giant Spaceship Watermark */}
          <div className="absolute top-1/2 left-1/2 spaceship-watermark" style={{ transform: 'translate(-50%, -50%) rotate(-15deg)', opacity: 0.08, width: '1200px', height: '800px' }}>
            <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Main saucer section */}
              <ellipse cx="400" cy="200" rx="300" ry="80" fill="url(#saucer-gradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>

              {/* Command dome */}
              <ellipse cx="400" cy="180" rx="100" ry="40" fill="url(#dome-gradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>

              {/* Warp nacelles (engines) */}
              <g>
                {/* Left nacelle */}
                <rect x="150" y="240" width="140" height="40" rx="20" fill="url(#nacelle-gradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <ellipse cx="160" cy="260" rx="15" ry="18" fill="url(#engine-glow-gradient)" className="engine-glow"/>

                {/* Right nacelle */}
                <rect x="510" y="240" width="140" height="40" rx="20" fill="url(#nacelle-gradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <ellipse cx="640" cy="260" rx="15" ry="18" fill="url(#engine-glow-gradient)" className="engine-glow"/>

                {/* Support pylons */}
                <path d="M 250 230 L 220 240 L 220 280 L 250 270 Z" fill="rgba(200,220,255,0.6)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                <path d="M 550 230 L 580 240 L 580 280 L 550 270 Z" fill="rgba(200,220,255,0.6)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
              </g>

              {/* Engineering hull/neck */}
              <path d="M 370 220 L 370 300 L 430 300 L 430 220 Z" fill="url(#hull-gradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>

              {/* Deflector dish */}
              <circle cx="400" cy="290" r="25" fill="url(#deflector-gradient)" stroke="rgba(100,180,255,0.5)" strokeWidth="2"/>
              <circle cx="400" cy="290" r="15" fill="rgba(100,200,255,0.3)" className="engine-glow"/>

              {/* Windows/lights */}
              <g opacity="0.6">
                <circle cx="380" cy="185" r="3" fill="#FFD700"/>
                <circle cx="400" cy="185" r="3" fill="#FFD700"/>
                <circle cx="420" cy="185" r="3" fill="#FFD700"/>
                <circle cx="360" cy="195" r="2" fill="#87CEEB"/>
                <circle cx="380" cy="195" r="2" fill="#87CEEB"/>
                <circle cx="420" cy="195" r="2" fill="#87CEEB"/>
                <circle cx="440" cy="195" r="2" fill="#87CEEB"/>
              </g>

              {/* Gradients */}
              <defs>
                <linearGradient id="saucer-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(180,200,255,0.8)"/>
                  <stop offset="50%" stopColor="rgba(120,150,220,0.9)"/>
                  <stop offset="100%" stopColor="rgba(80,100,180,0.7)"/>
                </linearGradient>
                <linearGradient id="dome-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(200,220,255,0.9)"/>
                  <stop offset="100%" stopColor="rgba(140,170,230,0.8)"/>
                </linearGradient>
                <linearGradient id="nacelle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(100,140,200,0.8)"/>
                  <stop offset="100%" stopColor="rgba(80,120,180,0.9)"/>
                </linearGradient>
                <radialGradient id="engine-glow-gradient">
                  <stop offset="0%" stopColor="rgba(100,200,255,0.9)"/>
                  <stop offset="50%" stopColor="rgba(80,150,255,0.6)"/>
                  <stop offset="100%" stopColor="rgba(60,100,200,0.3)"/>
                </radialGradient>
                <linearGradient id="hull-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(160,180,220,0.8)"/>
                  <stop offset="100%" stopColor="rgba(100,130,180,0.9)"/>
                </linearGradient>
                <radialGradient id="deflector-gradient">
                  <stop offset="0%" stopColor="rgba(150,220,255,0.8)"/>
                  <stop offset="100%" stopColor="rgba(80,150,220,0.6)"/>
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Floating Background Elements */}
          {floatingElements.map((el, i) => (
            <div
              key={i}
              className={`absolute ${el.size} ${i % 2 === 0 ? 'float' : 'float-slow'} opacity-30`}
              style={{
                left: el.left,
                top: el.top,
                '--duration': `${el.duration}s`,
                animationDelay: `${el.delay}s`,
              }}
            >
              {el.emoji}
            </div>
          ))}

          {/* Shooting Stars */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute text-yellow-300 text-2xl shooting-star"
              style={{
                top: `${Math.random() * 50}%`,
                left: '-100px',
                animationDelay: `${i * 4 + 2}s`,
              }}
            >
              ✨
            </div>
          ))}

          <div className="max-w-2xl w-full relative z-10">
            {/* Logo and Title */}
            <div className="text-center mb-12 fade-in-up">
              <div className="text-8xl mb-6 rocket-float inline-block">🚀</div>
              <h1 className="text-6xl font-extrabold text-white mb-4">
                Galactic <span className="text-yellow-300 pulse-glow">Quest</span>
              </h1>
              <p className="text-xl text-blue-200 fade-in-up" style={{ animationDelay: '0.2s' }}>
                Your Adventure in Learning Begins Here
              </p>
            </div>

          {/* Action Buttons */}
          <div className="space-y-6">
            {/* Existing Users */}
            {allUsers.length > 0 && (
              <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-pink-500/30 fade-in-up" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                  Welcome Back! 👋
                </h2>
                <p className="text-blue-200 text-center mb-6">
                  Select your profile to continue
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {allUsers.map((user, index) => (
                    <button
                      key={user}
                      onClick={() => handleQuickLogin(user)}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-110 hover:-rotate-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl relative overflow-hidden group"
                      style={{
                        animation: `fadeInUp 0.6s ease-out forwards`,
                        animationDelay: `${0.5 + index * 0.1}s`,
                        opacity: 0,
                      }}
                    >
                      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
                        <div className="text-3xl mb-1 transition-transform group-hover:scale-125">🚀</div>
                        <div className="text-lg">{user}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* New User */}
            <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-pink-500/30 fade-in-up" style={{ animationDelay: allUsers.length > 0 ? '0.6s' : '0.4s' }}>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                {allUsers.length > 0 ? 'New Explorer?' : 'Start Your Journey'}
              </h2>
              <p className="text-blue-200 text-center mb-6">
                Create your unique space explorer profile
              </p>
              <button
                onClick={() => setMode('register')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg text-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100"></div>
                <span className="relative">🌟 Create New Profile</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-blue-300 text-sm fade-in-up" style={{ animationDelay: '0.8s' }}>
            <p>No passwords needed • Kid-friendly • Safe & Secure</p>
          </div>
        </div>
        </div>
      </>
    )
  }

  if (mode === 'register') {
    return (
      <>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-15px) translateX(10px); }
            75% { transform: translateY(15px) translateX(-10px); }
          }
          @keyframes pulse-star {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.2) rotate(180deg); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          @keyframes inputGlow {
            0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(147, 51, 234, 0.4); }
          }
          .float { animation: float var(--duration, 20s) ease-in-out infinite; }
          .float-slow { animation: floatSlow var(--duration, 25s) ease-in-out infinite; }
          .pulse-star { animation: pulse-star 3s ease-in-out infinite; }
          .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
          .shimmer {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            background-size: 1000px 100%;
            animation: shimmer 3s infinite;
          }
          .input-glow:focus { animation: inputGlow 2s ease-in-out infinite; }
        `}</style>

        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4 relative overflow-hidden">
          {/* Giant Spaceship Watermark */}
          <div className="absolute top-1/2 left-1/2 spaceship-watermark" style={{ transform: 'translate(-50%, -50%) rotate(-15deg)', opacity: 0.08, width: '1200px', height: '800px' }}>
            <svg viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Main saucer section */}
              <ellipse cx="400" cy="200" rx="300" ry="80" fill="url(#saucer-gradient-reg)" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>

              {/* Command dome */}
              <ellipse cx="400" cy="180" rx="100" ry="40" fill="url(#dome-gradient-reg)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>

              {/* Warp nacelles (engines) */}
              <g>
                {/* Left nacelle */}
                <rect x="150" y="240" width="140" height="40" rx="20" fill="url(#nacelle-gradient-reg)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <ellipse cx="160" cy="260" rx="15" ry="18" fill="url(#engine-glow-gradient-reg)" className="engine-glow"/>

                {/* Right nacelle */}
                <rect x="510" y="240" width="140" height="40" rx="20" fill="url(#nacelle-gradient-reg)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                <ellipse cx="640" cy="260" rx="15" ry="18" fill="url(#engine-glow-gradient-reg)" className="engine-glow"/>

                {/* Support pylons */}
                <path d="M 250 230 L 220 240 L 220 280 L 250 270 Z" fill="rgba(200,220,255,0.6)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                <path d="M 550 230 L 580 240 L 580 280 L 550 270 Z" fill="rgba(200,220,255,0.6)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
              </g>

              {/* Engineering hull/neck */}
              <path d="M 370 220 L 370 300 L 430 300 L 430 220 Z" fill="url(#hull-gradient-reg)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>

              {/* Deflector dish */}
              <circle cx="400" cy="290" r="25" fill="url(#deflector-gradient-reg)" stroke="rgba(100,180,255,0.5)" strokeWidth="2"/>
              <circle cx="400" cy="290" r="15" fill="rgba(100,200,255,0.3)" className="engine-glow"/>

              {/* Windows/lights */}
              <g opacity="0.6">
                <circle cx="380" cy="185" r="3" fill="#FFD700"/>
                <circle cx="400" cy="185" r="3" fill="#FFD700"/>
                <circle cx="420" cy="185" r="3" fill="#FFD700"/>
                <circle cx="360" cy="195" r="2" fill="#87CEEB"/>
                <circle cx="380" cy="195" r="2" fill="#87CEEB"/>
                <circle cx="420" cy="195" r="2" fill="#87CEEB"/>
                <circle cx="440" cy="195" r="2" fill="#87CEEB"/>
              </g>

              {/* Gradients */}
              <defs>
                <linearGradient id="saucer-gradient-reg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(180,200,255,0.8)"/>
                  <stop offset="50%" stopColor="rgba(120,150,220,0.9)"/>
                  <stop offset="100%" stopColor="rgba(80,100,180,0.7)"/>
                </linearGradient>
                <linearGradient id="dome-gradient-reg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(200,220,255,0.9)"/>
                  <stop offset="100%" stopColor="rgba(140,170,230,0.8)"/>
                </linearGradient>
                <linearGradient id="nacelle-gradient-reg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(100,140,200,0.8)"/>
                  <stop offset="100%" stopColor="rgba(80,120,180,0.9)"/>
                </linearGradient>
                <radialGradient id="engine-glow-gradient-reg">
                  <stop offset="0%" stopColor="rgba(100,200,255,0.9)"/>
                  <stop offset="50%" stopColor="rgba(80,150,255,0.6)"/>
                  <stop offset="100%" stopColor="rgba(60,100,200,0.3)"/>
                </radialGradient>
                <linearGradient id="hull-gradient-reg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(160,180,220,0.8)"/>
                  <stop offset="100%" stopColor="rgba(100,130,180,0.9)"/>
                </linearGradient>
                <radialGradient id="deflector-gradient-reg">
                  <stop offset="0%" stopColor="rgba(150,220,255,0.8)"/>
                  <stop offset="100%" stopColor="rgba(80,150,220,0.6)"/>
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Floating Background Elements */}
          {floatingElements.map((el, i) => (
            <div
              key={i}
              className={`absolute ${el.size} ${i % 2 === 0 ? 'float' : 'float-slow'} opacity-30`}
              style={{
                left: el.left,
                top: el.top,
                '--duration': `${el.duration}s`,
                animationDelay: `${el.delay}s`,
              }}
            >
              {el.emoji}
            </div>
          ))}

          <div className="max-w-md w-full relative z-10">
            <button
              onClick={() => {
                setMode('choose')
                setUsername('')
                setError('')
              }}
              className="mb-6 text-blue-200 hover:text-white transition-all duration-300 flex items-center gap-2 hover:gap-3 fade-in-up"
            >
              ← Back
            </button>

            <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-pink-500/30 fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4 pulse-star inline-block">🌟</div>
                <h2 className="text-3xl font-bold text-white mb-2">Create Profile</h2>
                <p className="text-blue-200">Choose your space explorer name</p>
              </div>

              <div className="space-y-6">
                <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <label className="block text-white font-semibold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:outline-none text-gray-900 font-semibold text-lg transition-all duration-300 input-glow"
                    maxLength={20}
                    autoFocus
                  />
                  <p className="text-blue-200 text-sm mt-2">
                    3-20 characters • Letters, numbers, and underscores only
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-3 text-red-200 text-center fade-in-up">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  disabled={loading || !username.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg relative overflow-hidden group fade-in-up"
                  style={{ animationDelay: '0.6s' }}
                >
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100"></div>
                  <span className="relative">{loading ? 'Creating...' : '🚀 Start Adventure'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return null
}
