import { useState } from 'react'
import { SUBJECT_META } from '../data/questions'
import { getAccuracy } from '../utils/gameLogic'

const SUBJECTS = ['math', 'science', 'reading', 'geography']

const DIFF_LABELS = ['', 'Cadet', 'Pilot', 'Commander']
const DIFF_STARS  = ['', '⭐', '⭐⭐', '⭐⭐⭐']
const DIFF_COLORS = ['', 'text-galactic-green', 'text-galactic-yellow', 'text-galactic-red']

export default function SubjectSelectScreen({ gameState, navigate }) {
  const { subjects } = gameState
  const [selectedSubject, setSelectedSubject] = useState(null)

  return (
    <div className="slide-up">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('home')}
          className="text-slate-400 hover:text-white text-lg"
          aria-label="Back"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold gradient-text">Galaxy Map</h1>
          <p className="text-xs text-slate-400">Choose a planet to conquer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {SUBJECTS.map(key => {
          const meta  = SUBJECT_META[key]
          const subj  = subjects[key]
          const acc   = getAccuracy(subj.totalAnswered, subj.totalCorrect)
          const diff  = subj.difficulty

          return (
            <button
              key={key}
              onClick={() => setSelectedSubject(key)}
              className={`galactic-card p-5 text-left hover:-translate-y-1 active:translate-y-0 transition-all duration-200 group relative overflow-hidden`}
              style={{
                borderColor: meta.accent + '66',
                boxShadow: `0 0 20px ${meta.accent}33`,
              }}
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: `radial-gradient(circle at 80% 50%, ${meta.accent}, transparent 60%)` }}
              />

              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-4">
                  <div className="text-5xl float" style={{ animationDelay: `${SUBJECTS.indexOf(key) * 0.5}s` }}>
                    {meta.emoji}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{meta.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{meta.subtitle}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {meta.topics.map(t => (
                        <span key={t} className="text-xs bg-slate-800 text-slate-300 rounded-full px-2 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className={`font-bold text-sm ${DIFF_COLORS[diff]}`}>
                    {DIFF_STARS[diff]}
                  </div>
                  <div className={`text-xs mt-0.5 font-semibold ${DIFF_COLORS[diff]}`}>
                    {DIFF_LABELS[diff]}
                  </div>
                  {subj.totalAnswered > 0 && (
                    <div className="text-xs text-slate-500 mt-1">
                      {acc}% accuracy
                    </div>
                  )}
                  {subj.totalAnswered === 0 && (
                    <div className="text-xs text-slate-600 mt-1">Not started</div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {subj.totalAnswered > 0 && (
                <div className="mt-3 relative">
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${acc}%`, background: meta.accent }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{subj.totalAnswered} questions answered</span>
                    <span>{subj.totalCorrect} correct</span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Speed round option at bottom */}
      <button
        onClick={() => navigate('speedround')}
        className="galactic-card w-full p-4 mt-4 text-center hover:border-galactic-purple transition-all group"
        style={{ borderColor: '#7c3aed66' }}
      >
        <span className="text-2xl group-hover:float inline-block mr-2">⚡</span>
        <span className="font-bold text-galactic-purple">Speed Round</span>
        <span className="text-slate-400 text-sm ml-2">— All subjects mixed, 60 seconds!</span>
      </button>

      {/* Mode Selection Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 max-w-2xl w-full border-4 border-yellow-400">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{SUBJECT_META[selectedSubject].emoji}</div>
              <h2 className="text-3xl font-bold text-white mb-2">Choose Your Adventure</h2>
              <p className="text-blue-200">How do you want to learn {SUBJECT_META[selectedSubject].label}?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Quiz Mode */}
              <button
                onClick={() => {
                  navigate('quiz', { subject: selectedSubject })
                  setSelectedSubject(null)
                }}
                className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white hover:scale-105 transition-all group"
              >
                <div className="text-5xl mb-3 group-hover:float">📝</div>
                <h3 className="text-2xl font-bold mb-2">Quiz Mode</h3>
                <p className="text-blue-100 text-sm">
                  Answer 10 questions in a classic quiz format. Great for focused practice!
                </p>
                <div className="mt-4 text-yellow-300 font-semibold">
                  → Standard Learning
                </div>
              </button>

              {/* Castle Explorer Mode */}
              <button
                onClick={() => {
                  navigate('castle', { subject: selectedSubject })
                  setSelectedSubject(null)
                }}
                className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white hover:scale-105 transition-all group"
              >
                <div className="text-5xl mb-3 group-hover:float">🏰</div>
                <h3 className="text-2xl font-bold mb-2">Castle Explorer</h3>
                <p className="text-pink-100 text-sm">
                  Answer questions to gain energy, explore the castle, defeat monsters, and find treasure!
                </p>
                <div className="mt-4 text-yellow-300 font-semibold">
                  ✨ Adventure Mode ✨
                </div>
              </button>
            </div>

            <button
              onClick={() => setSelectedSubject(null)}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
