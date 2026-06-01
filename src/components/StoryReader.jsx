import { useState } from 'react'
import { processAnswer } from '../utils/gameLogic'

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export default function StoryReader({ story, gameState, updateState, onExit, onComplete }) {
  const [phase, setPhase] = useState('reading') // 'reading', 'quiz', 'results'
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalXP, setTotalXP] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)

  const question = story.questions[currentQuestion]
  const progress = Math.round(((currentQuestion + 1) / story.questions.length) * 100)

  function handleStartQuiz() {
    setPhase('quiz')
  }

  function handleAnswer(optionIdx) {
    if (revealed) return
    setSelected(optionIdx)
    setRevealed(true)

    const isCorrect = optionIdx === question.correct
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1)
    }

    // Award XP and coins
    updateState(prev => {
      const { newState, xpGained, coinsGained } = processAnswer(
        prev,
        'reading',
        isCorrect,
        story.difficulty
      )
      setTotalXP(prevXP => prevXP + xpGained)
      setTotalCoins(prevCoins => prevCoins + coinsGained)
      return newState
    })
  }

  function handleNext() {
    if (currentQuestion + 1 >= story.questions.length) {
      setPhase('results')
    } else {
      setCurrentQuestion(prev => prev + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  // Reading phase
  if (phase === 'reading') {
    return (
      <div className="slide-up max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onExit}
            className="transition-colors"
            style={{ color: '#00ffff' }}
          >
            ← Back to Library
          </button>
          <div className="text-sm" style={{ color: '#ffeb3b' }}>
            📖 {story.readingTime} min read
          </div>
        </div>

        <div className="p-8 rounded-2xl border-2 mb-6" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: '#ff1493',
          boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)'
        }}>
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{story.emoji}</div>
            <h1 className="text-3xl font-extrabold mb-2" style={{
              background: 'linear-gradient(90deg, #ff1493, #ffeb3b, #00ff87)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {story.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm" style={{ color: '#00ffff' }}>
              <span className="px-3 py-1 rounded-full border" style={{
                borderColor: story.difficulty === 1 ? '#00ff87' : story.difficulty === 2 ? '#ffeb3b' : '#ff1493',
                color: story.difficulty === 1 ? '#00ff87' : story.difficulty === 2 ? '#ffeb3b' : '#ff1493'
              }}>
                {story.difficulty === 1 ? 'Easy' : story.difficulty === 2 ? 'Medium' : 'Hard'}
              </span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            {story.story.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4 leading-relaxed text-lg" style={{ color: '#ffffff' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartQuiz}
          className="w-full py-4 rounded-xl font-bold text-xl transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #ff1493, #00ffff)',
            color: '#ffffff',
            boxShadow: '0 4px 20px rgba(255, 20, 147, 0.4)'
          }}
        >
          📝 Start Comprehension Quiz
        </button>
      </div>
    )
  }

  // Quiz phase
  if (phase === 'quiz') {
    return (
      <div className="slide-up max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onExit}
            className="transition-colors"
            style={{ color: '#00ffff' }}
          >
            ← Exit
          </button>
          <div className="text-sm" style={{ color: '#ffeb3b' }}>
            Question {currentQuestion + 1} / {story.questions.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #ff1493, #ffeb3b)',
              boxShadow: '0 0 15px rgba(255, 20, 147, 0.6)'
            }}
          />
        </div>

        {/* Score tracker */}
        <div className="flex justify-between text-sm mb-4" style={{ color: '#00ffff' }}>
          <span>✅ {correctAnswers} correct</span>
          <span>⭐ {totalXP} XP earned</span>
        </div>

        {/* Question card */}
        <div className="p-6 rounded-2xl border-2 mb-5" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: '#ff1493',
          boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)'
        }}>
          <div className="text-lg font-semibold leading-snug mb-4" style={{ color: '#ffffff' }}>
            {question.question}
          </div>
        </div>

        {/* Answer options */}
        <div className="grid grid-cols-1 gap-3 mb-5">
          {question.options.map((opt, i) => {
            let bgColor = 'rgba(0, 0, 0, 0.6)'
            let borderColor = '#ff1493'
            let textColor = '#ffffff'
            let btnClass = 'border-2 transition-all duration-200'

            if (revealed) {
              if (i === question.correct) {
                bgColor = 'rgba(0, 255, 135, 0.2)'
                borderColor = '#00ff87'
                textColor = '#00ff87'
                btnClass += ' glow-green'
              } else if (i === selected && i !== question.correct) {
                bgColor = 'rgba(255, 68, 68, 0.2)'
                borderColor = '#ff4444'
                textColor = '#ff4444'
              } else {
                bgColor = 'rgba(0, 0, 0, 0.4)'
                borderColor = 'rgba(255, 255, 255, 0.1)'
                textColor = 'rgba(255, 255, 255, 0.3)'
                btnClass += ' opacity-50'
              }
            } else {
              btnClass += ' hover:border-opacity-100 hover:shadow-lg cursor-pointer'
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={revealed}
                className={`w-full text-left p-4 rounded-xl font-medium flex items-center gap-3 ${btnClass}`}
                style={{
                  background: bgColor,
                  borderColor: borderColor,
                  color: textColor,
                  boxShadow: revealed && i === question.correct ? '0 0 30px rgba(0, 255, 135, 0.4)' : 'none'
                }}
              >
                <span
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                  style={{
                    background: revealed && i === question.correct ? '#00ff87' : revealed && i === selected ? '#ff4444' : '#ff1493',
                    color: '#000000'
                  }}
                >
                  {OPTION_LETTERS[i]}
                </span>
                <span>{opt}</span>
                {revealed && i === question.correct && <span className="ml-auto">✅</span>}
                {revealed && i === selected && i !== question.correct && <span className="ml-auto">❌</span>}
              </button>
            )
          })}
        </div>

        {/* Explanation + Next */}
        {revealed && (
          <div className="slide-up">
            <div className={`p-4 rounded-2xl border-2 mb-4 ${selected === question.correct ? 'glow-green' : ''}`} style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: selected === question.correct ? '#00ff87' : '#ff1493'
            }}>
              <div className="font-bold mb-1" style={{
                color: selected === question.correct ? '#00ff87' : '#ff4444'
              }}>
                {selected === question.correct ? '🎉 Correct! Great comprehension!' : '💡 Not quite—here\'s why:'}
              </div>
              <div className="text-sm" style={{ color: '#ffffff' }}>
                {question.explanation}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #ff1493, #00ffff)',
                color: '#ffffff'
              }}
            >
              {currentQuestion + 1 >= story.questions.length ? '🚀 See Results!' : 'Next Question →'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Results phase
  if (phase === 'results') {
    const percentage = Math.round((correctAnswers / story.questions.length) * 100)
    const rank =
      percentage === 100 ? { label: 'Perfect Comprehension! 🏆', color: '#ffeb3b' } :
      percentage >= 80   ? { label: 'Excellent Understanding! 🌟', color: '#00ff87' } :
      percentage >= 60   ? { label: 'Good Job! 👍', color: '#00ffff' } :
                           { label: 'Keep Practicing! 💪', color: '#ff1493' }

    return (
      <div className="slide-up max-w-2xl mx-auto text-center">
        <div className="p-8 rounded-2xl border-2 mb-6" style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderColor: rank.color,
          boxShadow: `0 0 30px ${rank.color}40`
        }}>
          <div className="text-6xl mb-4">📚</div>
          <div className="text-3xl font-bold mb-2" style={{ color: rank.color }}>
            {rank.label}
          </div>
          <div className="text-sm mb-6" style={{ color: '#00ffff' }}>
            You finished "{story.title}"
          </div>

          {/* Score circle */}
          <div
            className="inline-flex items-center justify-center w-32 h-32 rounded-full text-4xl font-bold mb-4 border-4"
            style={{ borderColor: rank.color, color: rank.color }}
          >
            {correctAnswers}/{story.questions.length}
          </div>

          <div className="mb-6" style={{ color: '#ffffff' }}>
            <div className="text-2xl font-bold">{percentage}% Accuracy</div>
          </div>

          {/* Rewards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl border-2" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#ffeb3b'
            }}>
              <div className="text-3xl mb-1">⭐</div>
              <div className="font-bold" style={{ color: '#ffeb3b' }}>+{totalXP} XP</div>
            </div>
            <div className="p-4 rounded-xl border-2" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              borderColor: '#ffeb3b'
            }}>
              <div className="text-3xl mb-1">💰</div>
              <div className="font-bold" style={{ color: '#ffeb3b' }}>+{totalCoins} Coins</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onComplete}
            className="flex-1 py-3 rounded-xl border-2 font-bold transition-colors"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderColor: '#00ffff',
              color: '#00ffff'
            }}
          >
            📚 Back to Library
          </button>
          <button
            onClick={() => navigate('home')}
            className="flex-1 py-3 rounded-xl font-bold transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #ff1493, #00ffff)',
              color: '#ffffff'
            }}
          >
            🏠 Home
          </button>
        </div>
      </div>
    )
  }

  return null
}
