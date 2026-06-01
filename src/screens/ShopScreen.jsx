import { useState } from 'react'
import { SHOP_ITEMS, buyItem } from '../utils/gameLogic'

export default function ShopScreen({ gameState, updateState, navigate }) {
  const { player } = gameState
  const [toast, setToast] = useState(null)

  function handleBuy(item) {
    updateState(prev => {
      const { newState, success, reason } = buyItem(prev, item.id)
      if (success) {
        const message = item.type === 'theme'
          ? `🎉 You unlocked ${item.emoji} ${item.label}!`
          : `🎉 You got ${item.emoji} ${item.label}!`
        showToast(message, 'success')
      } else {
        showToast(reason === 'Level too low'
          ? `🔒 Reach Level ${item.reqLevel} to unlock this!`
          : reason === 'Not enough coins'
          ? `💰 Need ${item.cost - prev.player.coins} more coins!`
          : `Already owned!`, 'error')
      }
      return newState
    })
  }

  function handleEquip(emoji) {
    updateState(prev => ({
      ...prev,
      player: { ...prev.player, avatar: emoji }
    }))
    showToast('✅ Avatar equipped!', 'success')
  }

  function handleEquipTheme(themeId) {
    updateState(prev => ({
      ...prev,
      player: { ...prev.player, theme: themeId }
    }))
    showToast('✅ Theme equipped!', 'success')
  }

  function showToast(msg, type) {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('home')} className="text-slate-400 hover:text-white text-lg">←</button>
          <div>
            <h1 className="text-xl font-bold gradient-text">🏪 Galactic Shop</h1>
            <p className="text-xs text-slate-400">Spend your hard-earned coins!</p>
          </div>
        </div>
        <div className="galactic-card px-3 py-1.5 text-galactic-yellow font-bold text-sm">
          💰 {player.coins}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-xl bounce-in
            ${toast.type === 'success' ? 'bg-galactic-green text-white' : 'bg-galactic-red text-white'}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Current avatar and theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="galactic-card p-4 flex items-center gap-4">
          <div className="text-5xl">{player.avatar}</div>
          <div>
            <div className="font-bold">Current Avatar</div>
            <div className="text-xs text-slate-400">Commander</div>
          </div>
        </div>
        <div className="galactic-card p-4 flex items-center gap-4">
          <div className="text-5xl">
            {player.theme === 'ocean' ? '🌊' :
             player.theme === 'forest' ? '🌲' :
             player.theme === 'fire' ? '🔥' :
             player.theme === 'neon' ? '💫' : '🚀'}
          </div>
          <div>
            <div className="font-bold">Current Theme</div>
            <div className="text-xs text-slate-400 capitalize">{player.theme || 'space'}</div>
          </div>
        </div>
      </div>

      {/* Avatars section */}
      <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-3">
        🎭 Avatar Collection
      </div>

      {/* Starter Avatars */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 font-semibold mb-2">⭐ Starter Collection</div>
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.filter(i => i.type === 'avatar' && i.reqLevel <= 2).map(item => {
            const owned    = player.unlockedAvatars.includes(item.emoji)
            const equipped = player.avatar === item.emoji
            const locked   = player.level < item.reqLevel
            const broke    = player.coins < item.cost && !owned

            return (
              <div
                key={item.id}
                className={`galactic-card p-4 transition-all ${equipped ? 'border-galactic-green glow-green' : locked ? 'opacity-60' : 'hover:border-slate-500'}`}
                style={equipped ? { borderColor: '#10b981' } : locked ? {} : {}}
              >
                <div className="text-4xl mb-2 text-center">{item.emoji}</div>
                <div className="font-semibold text-sm text-center mb-0.5">{item.label}</div>
                <div className="text-xs text-slate-500 text-center mb-3">
                  {locked ? `🔒 Requires Level ${item.reqLevel}` : owned ? '✅ Owned' : `💰 ${item.cost} coins`}
                </div>

                {equipped ? (
                  <div className="w-full py-1.5 text-center text-xs font-bold text-galactic-green">
                    ✅ Equipped
                  </div>
                ) : owned ? (
                  <button
                    onClick={() => handleEquip(item.emoji)}
                    className="w-full py-1.5 rounded-lg bg-galactic-green text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Equip
                  </button>
                ) : locked ? (
                  <div className="w-full py-1.5 text-center text-xs text-slate-600">
                    Level {item.reqLevel} needed
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={broke}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all
                      ${broke ? 'bg-black text-slate-600 cursor-not-allowed' : 'bg-galactic-yellow text-black hover:opacity-90 active:scale-95'}`}
                  >
                    {broke ? `Need ${item.cost - player.coins} more 💰` : `Buy · ${item.cost} 💰`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dragon Collection */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 font-semibold mb-2">🐉 Dragon Collection</div>
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.filter(i => i.type === 'avatar' && i.label.includes('Dragon')).map(item => {
            const owned    = player.unlockedAvatars.includes(item.emoji)
            const equipped = player.avatar === item.emoji
            const locked   = player.level < item.reqLevel
            const broke    = player.coins < item.cost && !owned

            return (
              <div
                key={item.id}
                className={`galactic-card p-4 transition-all ${equipped ? 'border-galactic-green glow-green' : locked ? 'opacity-60' : 'hover:border-slate-500'}`}
                style={equipped ? { borderColor: '#10b981' } : locked ? {} : {}}
              >
                <div className="text-4xl mb-2 text-center">{item.emoji}</div>
                <div className="font-semibold text-sm text-center mb-0.5">{item.label}</div>
                <div className="text-xs text-slate-500 text-center mb-3">
                  {locked ? `🔒 Requires Level ${item.reqLevel}` : owned ? '✅ Owned' : `💰 ${item.cost} coins`}
                </div>

                {equipped ? (
                  <div className="w-full py-1.5 text-center text-xs font-bold text-galactic-green">
                    ✅ Equipped
                  </div>
                ) : owned ? (
                  <button
                    onClick={() => handleEquip(item.emoji)}
                    className="w-full py-1.5 rounded-lg bg-galactic-green text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Equip
                  </button>
                ) : locked ? (
                  <div className="w-full py-1.5 text-center text-xs text-slate-600">
                    Level {item.reqLevel} needed
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={broke}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all
                      ${broke ? 'bg-black text-slate-600 cursor-not-allowed' : 'bg-galactic-yellow text-black hover:opacity-90 active:scale-95'}`}
                  >
                    {broke ? `Need ${item.cost - player.coins} more 💰` : `Buy · ${item.cost} 💰`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Special Creatures */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 font-semibold mb-2">🦄 Special Creatures</div>
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.filter(i => i.type === 'avatar' && i.reqLevel >= 3 && !i.label.includes('Dragon') && i.reqLevel < 5).map(item => {
            const owned    = player.unlockedAvatars.includes(item.emoji)
            const equipped = player.avatar === item.emoji
            const locked   = player.level < item.reqLevel
            const broke    = player.coins < item.cost && !owned

            return (
              <div
                key={item.id}
                className={`galactic-card p-4 transition-all ${equipped ? 'border-galactic-green glow-green' : locked ? 'opacity-60' : 'hover:border-slate-500'}`}
                style={equipped ? { borderColor: '#10b981' } : locked ? {} : {}}
              >
                <div className="text-4xl mb-2 text-center">{item.emoji}</div>
                <div className="font-semibold text-sm text-center mb-0.5">{item.label}</div>
                <div className="text-xs text-slate-500 text-center mb-3">
                  {locked ? `🔒 Requires Level ${item.reqLevel}` : owned ? '✅ Owned' : `💰 ${item.cost} coins`}
                </div>

                {equipped ? (
                  <div className="w-full py-1.5 text-center text-xs font-bold text-galactic-green">
                    ✅ Equipped
                  </div>
                ) : owned ? (
                  <button
                    onClick={() => handleEquip(item.emoji)}
                    className="w-full py-1.5 rounded-lg bg-galactic-green text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Equip
                  </button>
                ) : locked ? (
                  <div className="w-full py-1.5 text-center text-xs text-slate-600">
                    Level {item.reqLevel} needed
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={broke}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all
                      ${broke ? 'bg-black text-slate-600 cursor-not-allowed' : 'bg-galactic-yellow text-black hover:opacity-90 active:scale-95'}`}
                  >
                    {broke ? `Need ${item.cost - player.coins} more 💰` : `Buy · ${item.cost} 💰`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Elite & Legendary */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 font-semibold mb-2">👑 Elite & Legendary</div>
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.filter(i => i.type === 'avatar' && i.reqLevel >= 5).map(item => {
            const owned    = player.unlockedAvatars.includes(item.emoji)
            const equipped = player.avatar === item.emoji
            const locked   = player.level < item.reqLevel
            const broke    = player.coins < item.cost && !owned

            return (
              <div
                key={item.id}
                className={`galactic-card p-4 transition-all ${equipped ? 'border-galactic-green glow-green' : locked ? 'opacity-60' : 'hover:border-slate-500'}`}
                style={equipped ? { borderColor: '#10b981' } : locked ? {} : {}}
              >
                <div className="text-4xl mb-2 text-center">{item.emoji}</div>
                <div className="font-semibold text-sm text-center mb-0.5">{item.label}</div>
                <div className="text-xs text-slate-500 text-center mb-3">
                  {locked ? `🔒 Requires Level ${item.reqLevel}` : owned ? '✅ Owned' : `💰 ${item.cost} coins`}
                </div>

                {equipped ? (
                  <div className="w-full py-1.5 text-center text-xs font-bold text-galactic-green">
                    ✅ Equipped
                  </div>
                ) : owned ? (
                  <button
                    onClick={() => handleEquip(item.emoji)}
                    className="w-full py-1.5 rounded-lg bg-galactic-green text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Equip
                  </button>
                ) : locked ? (
                  <div className="w-full py-1.5 text-center text-xs text-slate-600">
                    Level {item.reqLevel} needed
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={broke}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all
                      ${broke ? 'bg-black text-slate-600 cursor-not-allowed' : 'bg-galactic-yellow text-black hover:opacity-90 active:scale-95'}`}
                  >
                    {broke ? `Need ${item.cost - player.coins} more 💰` : `Buy · ${item.cost} 💰`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Galaxy Themes */}
      <div className="mb-6">
        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-3">🎨 Galaxy Themes</div>
        <div className="text-xs text-slate-500 mb-3">Customize your learning experience with beautiful themes!</div>

        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.filter(i => i.type === 'theme').map(item => {
            const themeId = item.id.replace('theme_', '')
            const owned = player.unlockedThemes.includes(themeId)
            const equipped = player.theme === themeId
            const locked = player.level < item.reqLevel
            const broke = player.coins < item.cost && !owned

            return (
              <div
                key={item.id}
                className={`galactic-card p-4 transition-all ${equipped ? 'border-galactic-green glow-green' : locked ? 'opacity-60' : 'hover:border-slate-500'}`}
                style={equipped ? { borderColor: '#10b981' } : locked ? {} : {}}
              >
                <div className="text-4xl mb-2 text-center">{item.emoji}</div>
                <div className="font-semibold text-sm text-center mb-0.5">{item.label}</div>
                <div className="text-xs text-slate-500 text-center mb-3">
                  {locked ? `🔒 Requires Level ${item.reqLevel}` : owned ? '✅ Owned' : `💰 ${item.cost} coins`}
                </div>

                {equipped ? (
                  <div className="w-full py-1.5 text-center text-xs font-bold text-galactic-green">
                    ✅ Active
                  </div>
                ) : owned ? (
                  <button
                    onClick={() => handleEquipTheme(themeId)}
                    className="w-full py-1.5 rounded-lg bg-galactic-green text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    Activate
                  </button>
                ) : locked ? (
                  <div className="w-full py-1.5 text-center text-xs text-slate-600">
                    Level {item.reqLevel} needed
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={broke}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all
                      ${broke ? 'bg-black text-slate-600 cursor-not-allowed' : 'bg-galactic-yellow text-black hover:opacity-90 active:scale-95'}`}
                  >
                    {broke ? `Need ${item.cost - player.coins} more 💰` : `Buy · ${item.cost} 💰`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="galactic-card p-4 mb-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">📊 Collection Progress</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Avatars Unlocked</span>
          <span className="text-sm font-bold text-white">{player.unlockedAvatars.length} / {SHOP_ITEMS.filter(i => i.type === 'avatar').length + 1}</span>
        </div>
        <div className="w-full bg-black rounded-full h-2 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-galactic-blue to-galactic-purple transition-all duration-700"
            style={{ width: `${(player.unlockedAvatars.length / (SHOP_ITEMS.filter(i => i.type === 'avatar').length + 1)) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Themes Unlocked</span>
          <span className="text-sm font-bold text-white">{player.unlockedThemes.length} / {SHOP_ITEMS.filter(i => i.type === 'theme').length + 1}</span>
        </div>
        <div className="w-full bg-black rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-galactic-green to-galactic-cyan transition-all duration-700"
            style={{ width: `${(player.unlockedThemes.length / (SHOP_ITEMS.filter(i => i.type === 'theme').length + 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* How to earn coins */}
      <div className="galactic-card p-4 mt-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">💰 How to earn coins</div>
        <div className="space-y-1.5 text-xs text-slate-400">
          <div>✅ Correct answer (easy): 5 coins</div>
          <div>✅ Correct answer (medium): 8 coins</div>
          <div>✅ Correct answer (hard): 12 coins</div>
          <div>🏆 Perfect session (10/10): +25 bonus coins</div>
          <div>📋 Daily quest complete: +30 bonus coins</div>
          <div>🔥 Streak bonuses on XP (spent as you level up)</div>
        </div>
      </div>
    </div>
  )
}
