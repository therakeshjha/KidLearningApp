import { useState } from 'react'

export default function GradeSelectScreen({ onGradeSelected, showBackButton = false, onBack }) {
  const [selectedGrade, setSelectedGrade] = useState(null)

  const grades = [
    { grade: 1, label: '1st Grade', emoji: '🚀', color: '#ff1493' },
    { grade: 2, label: '2nd Grade', emoji: '🛸', color: '#00ffff' },
    { grade: 3, label: '3rd Grade', emoji: '🌟', color: '#ffeb3b' },
    { grade: 4, label: '4th Grade', emoji: '🪐', color: '#00ff87' },
    { grade: 5, label: '5th Grade', emoji: '🌌', color: '#ff4444' },
  ]

  function handleGradeClick(grade) {
    setSelectedGrade(grade)
  }

  function handleConfirm() {
    if (selectedGrade) {
      onGradeSelected(selectedGrade)
    }
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 20, 147, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 20, 147, 0.6); }
        }
        .float { animation: float 3s ease-in-out infinite; }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute text-6xl float opacity-20" style={{ left: '10%', top: '15%', animationDelay: '0s' }}>🪐</div>
        <div className="absolute text-4xl float opacity-20" style={{ left: '85%', top: '20%', animationDelay: '1s' }}>⭐</div>
        <div className="absolute text-5xl float opacity-20" style={{ left: '5%', top: '70%', animationDelay: '2s' }}>🌙</div>
        <div className="absolute text-3xl float opacity-20" style={{ left: '90%', top: '75%', animationDelay: '1.5s' }}>✨</div>

        <div className="max-w-4xl w-full relative z-10">
          {showBackButton && (
            <button
              onClick={onBack}
              className="mb-6 text-blue-200 hover:text-white transition-all duration-300 flex items-center gap-2 hover:gap-3"
            >
              ← Back
            </button>
          )}

          <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-pink-500/30">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 float inline-block">🎓</div>
              <h2 className="text-4xl font-bold text-white mb-2">Which grade are you in?</h2>
              <p className="text-blue-200 text-lg">
                Select your grade to get the right learning content for you!
              </p>
            </div>

            {/* Grade Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {grades.map(({ grade, label, emoji, color }) => (
                <button
                  key={grade}
                  onClick={() => handleGradeClick(grade)}
                  className={`p-6 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${
                    selectedGrade === grade
                      ? 'pulse-glow scale-105'
                      : 'hover:shadow-lg'
                  }`}
                  style={{
                    background: selectedGrade === grade
                      ? 'rgba(255, 255, 255, 0.15)'
                      : 'rgba(0, 0, 0, 0.3)',
                    borderColor: selectedGrade === grade ? color : 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="text-6xl mb-3">{emoji}</div>
                  <div className="text-xl font-bold text-white">{label}</div>
                </button>
              ))}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={!selectedGrade}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-lg"
            >
              {selectedGrade ? `Start Learning - ${grades[selectedGrade - 1].label}` : 'Select Your Grade'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
