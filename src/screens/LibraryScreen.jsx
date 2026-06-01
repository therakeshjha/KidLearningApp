import { useState } from 'react'
import { getAllStories } from '../data/stories'
import StoryReader from '../components/StoryReader'

export default function LibraryScreen({ gameState, updateState, navigate }) {
  const [selectedStory, setSelectedStory] = useState(null)
  const stories = getAllStories()

  // If a story is selected, show the reader
  if (selectedStory) {
    return (
      <StoryReader
        story={selectedStory}
        gameState={gameState}
        updateState={updateState}
        onExit={() => setSelectedStory(null)}
        onComplete={() => {
          setSelectedStory(null)
          navigate('library')
        }}
      />
    )
  }

  return (
    <div className="slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('home')}
          className="transition-colors"
          style={{ color: '#00ffff' }}
        >
          ← Back
        </button>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold" style={{
            background: 'linear-gradient(90deg, #ff1493, #ffeb3b, #00ff87)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📚 Galactic Library
          </h1>
          <p className="text-sm mt-1" style={{ color: '#00ffff' }}>
            Read stories and test your comprehension
          </p>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Instructions */}
      <div className="p-6 rounded-2xl border-2 mb-6" style={{
        background: 'rgba(0, 0, 0, 0.4)',
        borderColor: '#ffeb3b',
        boxShadow: '0 0 20px rgba(255, 235, 59, 0.3)'
      }}>
        <div className="flex items-start gap-4">
          <div className="text-4xl">📖</div>
          <div>
            <h3 className="font-bold text-lg mb-1" style={{ color: '#ffeb3b' }}>
              How It Works
            </h3>
            <p className="text-sm" style={{ color: '#ffffff' }}>
              Choose a story to read, then answer comprehension questions to earn XP and coins!
              Each story has 5 questions based on what you read.
            </p>
          </div>
        </div>
      </div>

      {/* Story Grid */}
      <div className="space-y-4">
        {stories.map((story) => {
          const difficultyLabel = story.difficulty === 1 ? 'Easy' : story.difficulty === 2 ? 'Medium' : 'Hard'
          const difficultyColor = story.difficulty === 1 ? '#00ff87' : story.difficulty === 2 ? '#ffeb3b' : '#ff1493'

          return (
            <button
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="w-full p-6 rounded-2xl border-2 transition-all hover:scale-105 text-left"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: difficultyColor,
                boxShadow: `0 0 20px ${difficultyColor}40`
              }}
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl flex-shrink-0">{story.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold" style={{ color: difficultyColor }}>
                      {story.title}
                    </h3>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full border"
                      style={{
                        color: difficultyColor,
                        borderColor: difficultyColor,
                        background: `${difficultyColor}20`
                      }}
                    >
                      {difficultyLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: '#00ffff' }}>
                    <span>📖 {story.readingTime} min read</span>
                    <span>❓ {story.questions.length} questions</span>
                    <span>⭐ {story.questions.length * 15} XP possible</span>
                  </div>
                </div>
                <div className="text-2xl" style={{ color: difficultyColor }}>→</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-8 text-center text-sm" style={{ color: '#00ffff' }}>
        💡 Tip: Take your time reading—the questions will test your understanding!
      </div>
    </div>
  )
}
