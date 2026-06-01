import { useState } from 'react'
import { getAccuracy, BADGES, LEVEL_THRESHOLDS } from '../utils/gameLogic'
import { SUBJECT_META } from '../data/questions'
import { resetState, resetQuestionPool, resetProgressForGradeChange } from '../utils/storage'

const SUBJECTS = ['math', 'science', 'reading', 'geography']

export default function ParentScreen({ gameState, updateState, navigate }) {
  const [pinInput, setPinInput]   = useState('')
  const [unlocked, setUnlocked]   = useState(false)
  const [pinError, setPinError]   = useState(false)
  const [activeTab, setActiveTab] = useState('progress')  // 'progress' | 'settings'
  const [newPin, setNewPin]       = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinMsg, setPinMsg]       = useState(null)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [resetQuestionsMsg, setResetQuestionsMsg] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(gameState.player.grade)
  const [showGradeConfirm, setShowGradeConfirm] = useState(false)

  const { player, subjects, sessions, settings } = gameState

  function tryUnlock() {
    if (pinInput === settings.parentPin) {
      setUnlocked(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPinInput('')
    }
  }

  function savePin() {
    if (newPin.length < 4) {
      setPinMsg({ text: 'PIN must be at least 4 characters', ok: false })
      return
    }
    if (newPin !== confirmPin) {
      setPinMsg({ text: 'PINs do not match', ok: false })
      return
    }
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, parentPin: newPin }
    }))
    setPinMsg({ text: '✅ PIN updated!', ok: true })
    setNewPin('')
    setConfirmPin('')
    setTimeout(() => setPinMsg(null), 2500)
  }

  function saveTimeLimit(val) {
    updateState(prev => ({
      ...prev,
      settings: { ...prev.settings, timeLimitMins: Number(val) }
    }))
  }

  function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true)
      return
    }
    const fresh = resetState()
    updateState(() => fresh)
    navigate('home')
  }

  function handleResetQuestions() {
    updateState(prev => resetQuestionPool(prev))
    setResetQuestionsMsg('✅ Question pool reset! All questions can now be answered again.')
    setTimeout(() => setResetQuestionsMsg(null), 3000)
  }

  function setChildName(name) {
    if (!name.trim()) return
    updateState(prev => ({
      ...prev,
      player: { ...prev.player, name: name.trim() }
    }))
  }

  function handleGradeChange() {
    if (selectedGrade === gameState.player.grade) {
      return // No change
    }
    setShowGradeConfirm(true)
  }

  function confirmGradeChange() {
    const result = resetProgressForGradeChange(selectedGrade)
    if (result.success) {
      updateState(result.state)
      setShowGradeConfirm(false)
      alert(`Grade changed to ${selectedGrade}${['st', 'nd', 'rd', 'th', 'th'][selectedGrade - 1]} grade! Progress reset.`)
    }
  }

  // Weekly question counts
  const weeklyQ = sessions.filter(s => {
    const d = new Date(s.date)
    const now = new Date()
    return (now - d) < 7 * 86400000
  })
  const weeklyCorrect = weeklyQ.reduce((a, s) => a + s.correct, 0)
  const weeklyTotal   = weeklyQ.reduce((a, s) => a + s.total, 0)

  // ── PIN gate ──────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="slide-up">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('home')} className="text-slate-400 hover:text-white text-lg">←</button>
          <h1 className="text-xl font-bold">🔒 Parent / Guardian View</h1>
        </div>

        <div className="galactic-card p-6 text-center max-w-xs mx-auto">
          <div className="text-4xl mb-4">🔑</div>
          <div className="font-bold mb-1">Enter PIN</div>
          <div className="text-xs text-slate-500 mb-4">Default PIN: 1234</div>

          <input
            type="password"
            value={pinInput}
            onChange={e => { setPinInput(e.target.value); setPinError(false) }}
            onKeyDown={e => e.key === 'Enter' && tryUnlock()}
            placeholder="Enter PIN"
            className="w-full bg-black border border-slate-600 rounded-xl px-4 py-3 text-center text-xl tracking-widest mb-3 focus:outline-none focus:border-galactic-blue"
            maxLength={8}
            autoFocus
          />

          {pinError && (
            <div className="text-galactic-red text-sm mb-3">Wrong PIN. Try again!</div>
          )}

          <button
            onClick={tryUnlock}
            className="w-full py-3 rounded-xl bg-galactic-blue text-white font-bold hover:opacity-90 transition-opacity"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  // ── Unlocked view ─────────────────────────────────────────────
  return (
    <div className="slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('home')} className="text-slate-400 hover:text-white text-lg">←</button>
          <h1 className="text-xl font-bold gradient-text">⚙️ Parent View</h1>
        </div>
        <div className="text-slate-500 text-xs">🔓 Unlocked</div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'progress' ? 'bg-galactic-blue text-white' : 'bg-black text-slate-400 hover:bg-slate-700'}`}
        >
          📊 Progress
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-galactic-blue text-white' : 'bg-black text-slate-400 hover:bg-slate-700'}`}
        >
          ⚙️ Settings
        </button>
      </div>

      {activeTab === 'progress' && (
        <div>
          {/* Player summary */}
          <div className="galactic-card p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{player.avatar}</span>
              <div>
                <div className="font-bold">{player.name}</div>
                <div className="text-xs text-slate-400">
                  Level {player.level} · {player.xp} XP total
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-galactic-orange">🔥 {player.streak}</div>
                <div className="text-xs text-slate-500">Day Streak</div>
              </div>
              <div className="bg-black rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-galactic-blue">{player.totalAnswered}</div>
                <div className="text-xs text-slate-500">Questions</div>
              </div>
              <div className="bg-black rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-galactic-green">
                  {getAccuracy(player.totalAnswered, player.totalCorrect)}%
                </div>
                <div className="text-xs text-slate-500">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Weekly summary */}
          {weeklyQ.length > 0 && (
            <div className="galactic-card p-4 mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                📅 This Week
              </div>
              <div className="flex justify-between text-sm">
                <span>Sessions: <strong>{weeklyQ.length}</strong></span>
                <span>Questions: <strong>{weeklyTotal}</strong></span>
                <span>Correct: <strong className="text-galactic-green">{weeklyCorrect}</strong></span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Accuracy: {getAccuracy(weeklyTotal, weeklyCorrect)}%
              </div>
            </div>
          )}

          {/* Per-subject breakdown */}
          <div className="galactic-card p-4 mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              🪐 By Subject
            </div>
            {SUBJECTS.map(key => {
              const meta = SUBJECT_META[key]
              const subj = subjects[key]
              const acc  = getAccuracy(subj.totalAnswered, subj.totalCorrect)
              const uniqueAnswered = subj.answeredQuestions?.length || 0
              const DIFF_LABELS = ['', 'Easy', 'Medium', 'Hard']
              const DIFF_COLS   = ['', 'text-galactic-green', 'text-galactic-yellow', 'text-galactic-red']
              return (
                <div key={key} className="py-2.5 border-b border-slate-800 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{meta.emoji}</span>
                      <span className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">{subj.totalAnswered} q</span>
                      <span className={`font-bold ${acc >= 80 ? 'text-galactic-green' : acc >= 60 ? 'text-galactic-yellow' : acc > 0 ? 'text-galactic-red' : 'text-slate-600'}`}>
                        {subj.totalAnswered > 0 ? `${acc}%` : '—'}
                      </span>
                      <span className={`${DIFF_COLS[subj.difficulty]}`}>
                        {DIFF_LABELS[subj.difficulty]}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 ml-7">
                    {uniqueAnswered} unique questions answered
                  </div>
                </div>
              )
            })}
          </div>

          {/* Badges earned */}
          {player.badges.length > 0 && (
            <div className="galactic-card p-4 mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                🏅 Badges Earned ({player.badges.length}/12)
              </div>
              <div className="flex flex-wrap gap-2">
                {player.badges.map(bid => {
                  const b = BADGES[bid]
                  return b ? (
                    <span key={bid} className="text-xs bg-black rounded-full px-2.5 py-1">
                      {b.emoji} {b.label}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          {/* Child name */}
          <div className="galactic-card p-4 mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              👤 Player Name
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                defaultValue={player.name}
                onBlur={e => setChildName(e.target.value)}
                className="flex-1 bg-black border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-galactic-blue"
                maxLength={20}
              />
            </div>
          </div>

          {/* Grade Level Section */}
          <div className="galactic-card p-4 mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              🎓 Change Grade Level
            </div>

            <div className="mb-4">
              <p className="text-white mb-2 text-sm">
                Current Grade: <span className="font-bold text-galactic-green">
                  {gameState.player.grade}{['st', 'nd', 'rd', 'th', 'th'][gameState.player.grade - 1]} Grade
                </span>
              </p>

              <label className="block text-white mb-2 font-semibold text-xs">Select New Grade:</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border-2 border-galactic-blue bg-space-dark text-white font-semibold text-sm"
              >
                <option value={1}>1st Grade</option>
                <option value={2}>2nd Grade</option>
                <option value={3}>3rd Grade</option>
                <option value={4}>4th Grade</option>
                <option value={5}>5th Grade</option>
              </select>
            </div>

            <button
              onClick={handleGradeChange}
              disabled={selectedGrade === gameState.player.grade}
              className="w-full py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{
                background: selectedGrade === gameState.player.grade
                  ? '#555'
                  : 'linear-gradient(135deg, #ff1493, #00ffff)',
                color: '#fff',
              }}
            >
              Change Grade
            </button>

            {showGradeConfirm && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-card-bg border-2 border-galactic-red rounded-2xl p-8 max-w-md">
                  <h3 className="text-2xl font-bold mb-4 text-galactic-red">⚠️ Confirm Grade Change</h3>
                  <p className="text-white mb-6 text-sm">
                    Changing grade will reset all subject difficulties to level 1 and clear your answered questions pool.
                    Your XP, coins, and badges will be preserved.
                  </p>
                  <p className="text-white mb-6 font-bold text-sm">
                    Continue changing to {selectedGrade}{['st', 'nd', 'rd', 'th', 'th'][selectedGrade - 1]} grade?
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowGradeConfirm(false)}
                      className="flex-1 py-3 rounded-xl font-bold bg-gray-500 hover:bg-gray-600 text-white text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmGradeChange}
                      className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #ff1493, #00ffff)' }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time limit */}
          <div className="galactic-card p-4 mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              ⏱️ Session Time Reminder
            </div>
            <select
              value={settings.timeLimitMins}
              onChange={e => saveTimeLimit(e.target.value)}
              className="w-full bg-black border border-slate-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-galactic-blue"
            >
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes (recommended)</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
            <div className="text-xs text-slate-500 mt-2">
              Note: This is a guideline — the app does not forcibly stop sessions.
            </div>
          </div>

          {/* Change PIN */}
          <div className="galactic-card p-4 mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              🔑 Change PIN
            </div>
            <input
              type="password"
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              placeholder="New PIN (min 4 chars)"
              className="w-full bg-black border border-slate-600 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:border-galactic-blue"
              maxLength={8}
            />
            <input
              type="password"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)}
              placeholder="Confirm PIN"
              className="w-full bg-black border border-slate-600 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:border-galactic-blue"
              maxLength={8}
            />
            {pinMsg && (
              <div className={`text-xs mb-2 ${pinMsg.ok ? 'text-galactic-green' : 'text-galactic-red'}`}>
                {pinMsg.text}
              </div>
            )}
            <button
              onClick={savePin}
              className="w-full py-2 rounded-xl bg-galactic-blue text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Save PIN
            </button>
          </div>

          {/* Reset question pool */}
          <div className="galactic-card p-4 mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              🔄 Reset Question Pool
            </div>
            <div className="text-xs text-slate-400 mb-3">
              Allow all questions to be answered again. Progress and stats will be kept.
            </div>
            {resetQuestionsMsg && (
              <div className="text-xs text-galactic-green mb-2">
                {resetQuestionsMsg}
              </div>
            )}
            <button
              onClick={handleResetQuestions}
              className="w-full py-2 rounded-xl bg-galactic-blue text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Reset Questions
            </button>
          </div>

          {/* Reset all progress */}
          <div className="galactic-card p-4 border-galactic-red">
            <div className="text-xs font-bold text-galactic-red uppercase tracking-wider mb-2">
              ⚠️ Reset All Progress
            </div>
            <div className="text-xs text-slate-400 mb-3">
              This will erase all XP, coins, badges, and session history. Cannot be undone.
            </div>
            {resetConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-400 text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-xl bg-galactic-red text-white text-sm font-bold hover:opacity-90"
                >
                  Yes, Reset Everything
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full py-2 rounded-xl border border-galactic-red text-galactic-red text-sm font-bold hover:bg-red-950 transition-colors"
              >
                Reset Progress
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
