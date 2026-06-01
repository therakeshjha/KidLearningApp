import { useState, useEffect } from 'react'
import { getSessionQuestions } from '../../data/questions'

const GRID_SIZE = 75
const CELL_SIZE = 16

// Tile types
const TILE = {
  WALL: 0,
  FLOOR: 1,
}

export default function CastleExplorerGame({ gameState, updateState, navigate, subject }) {
  // Create castle layout with rooms and hallways
  const [castleMap] = useState(() => {
    const map = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(TILE.WALL))

    // Helper to carve out a room
    const carveRoom = (startX, startY, width, height) => {
      for (let y = startY; y < startY + height && y < GRID_SIZE; y++) {
        for (let x = startX; x < startX + width && x < GRID_SIZE; x++) {
          map[y][x] = TILE.FLOOR
        }
      }
    }

    // Helper to carve a horizontal hallway
    const carveHallwayH = (startX, endX, y) => {
      const minX = Math.min(startX, endX)
      const maxX = Math.max(startX, endX)
      for (let x = minX; x <= maxX && x < GRID_SIZE; x++) {
        map[y][x] = TILE.FLOOR
      }
    }

    // Helper to carve a vertical hallway
    const carveHallwayV = (x, startY, endY) => {
      const minY = Math.min(startY, endY)
      const maxY = Math.max(startY, endY)
      for (let y = minY; y <= maxY && y < GRID_SIZE; y++) {
        map[y][x] = TILE.FLOOR
      }
    }

    // DEEP BASEMENT - LEVEL 1 (y: 65-74)
    carveRoom(3, 68, 8, 6) // Dungeon Cells 1
    carveRoom(15, 68, 9, 6) // Prison
    carveRoom(28, 69, 8, 5) // Torture Chamber
    carveRoom(40, 68, 10, 6) // Catacombs West
    carveRoom(54, 69, 9, 5) // Catacombs East
    carveRoom(66, 68, 7, 6) // Ancient Vault

    // BASEMENT - LEVEL 2 (y: 55-64)
    carveRoom(2, 58, 10, 6) // Lower Dungeon
    carveRoom(16, 57, 8, 7) // Storage Vault
    carveRoom(28, 58, 9, 6) // Wine Cellar
    carveRoom(41, 57, 12, 7) // Treasure Vault
    carveRoom(57, 58, 10, 6) // Secret Chamber 1
    carveRoom(70, 59, 4, 4) // Hidden Room

    // GROUND FLOOR - LEVEL 3 (y: 45-54)
    carveRoom(3, 49, 12, 5) // Grand Entrance Hall
    carveRoom(2, 45, 8, 3) // Guard Room West
    carveRoom(18, 48, 10, 6) // Servants Quarters
    carveRoom(32, 47, 12, 7) // Main Hall
    carveRoom(48, 49, 10, 5) // Guest Quarters
    carveRoom(62, 48, 10, 6) // Stables
    carveRoom(16, 45, 8, 2) // Guard Room East

    // SECOND FLOOR - LEVEL 4 (y: 35-44)
    carveRoom(2, 38, 10, 6) // Kitchen
    carveRoom(16, 37, 8, 7) // Pantry
    carveRoom(28, 36, 16, 8) // Grand Dining Hall
    carveRoom(48, 38, 10, 6) // Servants Hall
    carveRoom(62, 37, 10, 7) // Laundry
    carveRoom(3, 45, 6, 3) // Scullery

    // THIRD FLOOR - LEVEL 5 (y: 25-34)
    carveRoom(2, 28, 10, 6) // Armory West
    carveRoom(16, 27, 12, 7) // Barracks
    carveRoom(32, 26, 14, 8) // Training Grounds
    carveRoom(50, 28, 10, 6) // Officers Quarters
    carveRoom(64, 27, 9, 7) // War Room
    carveRoom(3, 35, 7, 4) // Weapon Storage

    // FOURTH FLOOR - LEVEL 6 (y: 15-24)
    carveRoom(2, 18, 12, 6) // Study West
    carveRoom(18, 17, 14, 7) // Grand Library
    carveRoom(36, 16, 18, 8) // Great Hall
    carveRoom(58, 18, 12, 6) // Music Room
    carveRoom(3, 25, 8, 4) // Reading Room

    // FIFTH FLOOR - LEVEL 7 (y: 8-14)
    carveRoom(2, 10, 10, 4) // Chapel West
    carveRoom(16, 9, 14, 5) // Grand Chapel
    carveRoom(34, 8, 16, 6) // Ballroom
    carveRoom(54, 10, 12, 4) // Gallery
    carveRoom(69, 9, 5, 5) // Observatory

    // TOP FLOOR - ROYAL LEVEL 8 (y: 0-7)
    carveRoom(2, 2, 8, 5) // Wizard Tower
    carveRoom(14, 1, 12, 6) // Throne Room
    carveRoom(30, 2, 10, 5) // Royal Treasury
    carveRoom(44, 1, 10, 6) // Royal Chambers
    carveRoom(58, 2, 8, 5) // Queen's Chamber
    carveRoom(70, 1, 4, 6) // Secret Sanctum

    // DEEP BASEMENT HALLWAYS
    carveHallwayH(10, 15, 71)
    carveHallwayH(23, 28, 71)
    carveHallwayH(35, 40, 71)
    carveHallwayH(49, 54, 71)
    carveHallwayH(62, 66, 71)
    carveHallwayV(37, 65, 71)

    // BASEMENT HALLWAYS
    carveHallwayH(11, 16, 61)
    carveHallwayH(23, 28, 61)
    carveHallwayH(36, 41, 61)
    carveHallwayH(52, 57, 61)
    carveHallwayV(37, 55, 61)

    // GROUND FLOOR HALLWAYS
    carveHallwayV(8, 48, 54)
    carveHallwayH(14, 18, 51)
    carveHallwayH(27, 32, 51)
    carveHallwayH(43, 48, 51)
    carveHallwayH(57, 62, 51)
    carveHallwayV(37, 45, 51)

    // SECOND FLOOR HALLWAYS
    carveHallwayV(8, 38, 44)
    carveHallwayH(11, 16, 41)
    carveHallwayH(23, 28, 40)
    carveHallwayH(43, 48, 41)
    carveHallwayH(57, 62, 41)
    carveHallwayV(37, 35, 41)

    // THIRD FLOOR HALLWAYS
    carveHallwayV(8, 28, 34)
    carveHallwayH(11, 16, 31)
    carveHallwayH(27, 32, 30)
    carveHallwayH(45, 50, 31)
    carveHallwayH(59, 64, 31)
    carveHallwayV(37, 25, 31)

    // FOURTH FLOOR HALLWAYS
    carveHallwayV(10, 18, 24)
    carveHallwayH(13, 18, 21)
    carveHallwayH(31, 36, 20)
    carveHallwayH(53, 58, 21)
    carveHallwayV(37, 15, 21)

    // FIFTH FLOOR HALLWAYS
    carveHallwayV(10, 10, 14)
    carveHallwayH(11, 16, 12)
    carveHallwayH(29, 34, 11)
    carveHallwayH(49, 54, 12)
    carveHallwayH(65, 69, 12)
    carveHallwayV(37, 8, 12)

    // ROYAL FLOOR HALLWAYS
    carveHallwayH(9, 14, 4)
    carveHallwayH(25, 30, 4)
    carveHallwayH(39, 44, 4)
    carveHallwayH(53, 58, 4)
    carveHallwayH(65, 70, 4)

    // MAIN VERTICAL SPINE (connects all 8 floors!)
    carveHallwayV(37, 1, 74)

    // SECONDARY VERTICAL CONNECTORS
    carveHallwayV(10, 10, 70)
    carveHallwayV(60, 10, 70)

    return map
  })

  // Player RPG stats
  const [player, setPlayer] = useState({
    x: 8,
    y: 51,
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    gold: 0,
    inventory: [],
    equipped: { weapon: null, armor: null }
  })

  const [energy, setEnergy] = useState(20)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [showCombat, setShowCombat] = useState(false)
  const [currentEnemy, setCurrentEnemy] = useState(null)
  const [combatLog, setCombatLog] = useState([])
  const [defeatedEnemies, setDefeatedEnemies] = useState(new Set())
  const [collectedItems, setCollectedItems] = useState(new Set())
  const [showInventory, setShowInventory] = useState(false)
  const [showNPC, setShowNPC] = useState(false)
  const [currentNPC, setCurrentNPC] = useState(null)
  const [npcDialogueStage, setNpcDialogueStage] = useState(0)
  const [npcReputation, setNpcReputation] = useState({})
  const [activeQuests, setActiveQuests] = useState([])
  const [completedQuests, setCompletedQuests] = useState([])
  const [secretRoomRevealed, setSecretRoomRevealed] = useState(false)
  const [attackAnimation, setAttackAnimation] = useState(null)
  const [attackEffect, setAttackEffect] = useState([])

  // Entity positions (only on floor tiles)
  const [entities] = useState(() => {
    const ents = {}

    // ============ NPCs WITH SERVICES ============
    ents['8,51'] = {
      type: '👸', name: 'Princess Luna', category: 'npc',
      dialogue: [
        'Welcome brave hero! The castle has 8 floors of danger.',
        'Monsters have invaded! Will you help save us?',
        'Thank you for helping! Here\'s a reward for your bravery.'
      ],
      services: ['quest', 'reward'],
      quest: { id: 'princess_rescue', name: 'Royal Rescue', description: 'Defeat 10 enemies', goal: 10, reward: { gold: 100, xp: 50 } }
    }
    ents['5,3'] = {
      type: '🧙', name: 'Wizard Merlin', category: 'npc',
      dialogue: [
        'Greetings, adventurer. I sense great potential in you.',
        'I can teach you magic... for a price.',
        'Your power grows! Come back when you\'re level 10.'
      ],
      services: ['shop', 'upgrade'],
      shop: [
        { name: 'Mana Boost', effect: 'maxHp', value: 20, cost: 80, description: '+20 Max HP' },
        { name: 'Power Surge', effect: 'attack', value: 5, cost: 100, description: '+5 Attack' },
        { name: 'Mystic Shield', effect: 'defense', value: 3, cost: 60, description: '+3 Defense' }
      ]
    }
    ents['22,20'] = {
      type: '🧙‍♀️', name: 'Librarian', category: 'npc',
      dialogue: [
        'Welcome to the Grand Library. Knowledge is power!',
        'Answer questions to earn my favor.',
        'You\'re quite knowledgeable! I\'ve revealed an ancient secret for you...'
      ],
      services: ['quest', 'lore', 'secret'],
      quest: { id: 'library_questions', name: 'Scholar\'s Path', description: 'Answer 5 questions correctly', goal: 5, reward: { gold: 50, xp: 80 } }
    }
    ents['5,50'] = {
      type: '💂', name: 'Captain Guard', category: 'npc',
      dialogue: [
        'The dungeons below are treacherous.',
        'I can heal your wounds for gold.',
        'Stay strong, warrior. The castle needs you!'
      ],
      services: ['heal', 'info']
    }
    ents['6,40'] = {
      type: '👨‍🍳', name: 'Head Chef', category: 'npc',
      dialogue: [
        'Hungry? I have the finest meals in the castle!',
        'My cooking can restore your strength.',
        'Come back anytime you need a meal!'
      ],
      services: ['heal', 'shop'],
      shop: [
        { name: 'Hearty Stew', effect: 'heal', value: 40, cost: 30, description: 'Restores 40 HP' },
        { name: 'Royal Feast', effect: 'heal', value: 80, cost: 50, description: 'Restores 80 HP' },
        { name: 'Energy Drink', effect: 'energy', value: 10, cost: 40, description: '+10 Energy' }
      ]
    }
    ents['35,30'] = {
      type: '⚔️', name: 'Weapons Master', category: 'npc',
      dialogue: [
        'Ah, a fellow warrior! Let me see your weapon.',
        'I can upgrade your equipment... for a price.',
        'Your weapon gleams with power! Well done!'
      ],
      services: ['upgrade', 'repair'],
      upgrades: [
        { name: 'Sharpen Weapon', effect: 'attack', value: 3, cost: 60, description: '+3 Attack' },
        { name: 'Reinforce Armor', effect: 'defense', value: 2, cost: 50, description: '+2 Defense' },
        { name: 'Expert Polish', effect: 'both', atkValue: 2, defValue: 2, cost: 90, description: '+2 ATK/DEF' }
      ]
    }
    ents['40,11'] = {
      type: '⛪', name: 'High Priest', category: 'npc',
      dialogue: [
        'Blessings upon you, child.',
        'Prayer can restore body and soul.',
        'The light protects those who fight for good!'
      ],
      services: ['heal', 'bless'],
      blessings: [
        { name: 'Minor Blessing', effect: 'heal', value: 50, cost: 20, description: 'Heal 50 HP' },
        { name: 'Full Blessing', effect: 'fullHeal', cost: 50, description: 'Restore all HP' },
        { name: 'Divine Protection', effect: 'buff', duration: 3, value: 5, cost: 80, description: '+5 DEF for 3 battles' }
      ]
    }
    ents['68,71'] = {
      type: '🧙‍♂️', name: 'Dark Sage', category: 'npc',
      dialogue: [
        'You dare enter the deep dungeons?',
        'I can offer you... dark powers.',
        'The darkness accepts your soul...'
      ],
      services: ['shop', 'curse'],
      shop: [
        { name: 'Dark Pact', effect: 'attack', value: 10, cost: 150, description: '+10 Attack (cursed)' },
        { name: 'Shadow Cloak', effect: 'defense', value: 8, cost: 120, description: '+8 Defense (cursed)' },
        { name: 'Demon Blood', effect: 'maxHp', value: 50, cost: 200, description: '+50 Max HP (cursed)' }
      ]
    }

    // ============ ENEMIES BY FLOOR ============

    // DEEP BASEMENT - Level 1 (y:65-74) - HARDEST ENEMIES
    ents['5,70'] = { type: '🐀', name: 'Plague Rat', category: 'enemy', hp: 35, maxHp: 35, attack: 6, defense: 2, xpReward: 18, goldReward: 12 }
    ents['8,71'] = { type: '🕷️', name: 'Giant Spider', category: 'enemy', hp: 45, maxHp: 45, attack: 8, defense: 3, xpReward: 22, goldReward: 16 }
    ents['18,70'] = { type: '💀', name: 'Skeleton Mage', category: 'enemy', hp: 60, maxHp: 60, attack: 12, defense: 5, xpReward: 32, goldReward: 24 }
    ents['20,72'] = { type: '🧟', name: 'Ancient Zombie', category: 'enemy', hp: 70, maxHp: 70, attack: 14, defense: 6, xpReward: 38, goldReward: 28 }
    ents['30,71'] = { type: '👹', name: 'Dungeon Fiend', category: 'enemy', hp: 80, maxHp: 80, attack: 16, defense: 7, xpReward: 45, goldReward: 35 }
    ents['33,70'] = { type: '🦂', name: 'Death Scorpion', category: 'enemy', hp: 75, maxHp: 75, attack: 15, defense: 8, xpReward: 42, goldReward: 32 }
    ents['44,71'] = { type: '💀', name: 'Lich', category: 'enemy', hp: 100, maxHp: 100, attack: 20, defense: 10, xpReward: 60, goldReward: 50 }
    ents['46,70'] = { type: '👻', name: 'Banshee', category: 'enemy', hp: 90, maxHp: 90, attack: 18, defense: 8, xpReward: 55, goldReward: 45 }
    ents['58,71'] = { type: '🐉', name: 'Shadow Dragon', category: 'enemy', hp: 150, maxHp: 150, attack: 28, defense: 15, xpReward: 100, goldReward: 90 }
    ents['69,70'] = { type: '😈', name: 'Demon Lord', category: 'enemy', hp: 200, maxHp: 200, attack: 32, defense: 18, xpReward: 150, goldReward: 130 }
    ents['71,2'] = { type: '😈', name: 'DEMON KING', category: 'enemy', hp: 300, maxHp: 300, attack: 40, defense: 22, xpReward: 500, goldReward: 400 }

    // BASEMENT - Level 2 (y:55-64)
    ents['6,60'] = { type: '🐀', name: 'Sewer Rat', category: 'enemy', hp: 30, maxHp: 30, attack: 5, defense: 2, xpReward: 15, goldReward: 10 }
    ents['9,61'] = { type: '🦇', name: 'Cave Bat', category: 'enemy', hp: 35, maxHp: 35, attack: 6, defense: 1, xpReward: 18, goldReward: 12 }
    ents['19,60'] = { type: '👹', name: 'Goblin Thief', category: 'enemy', hp: 50, maxHp: 50, attack: 9, defense: 4, xpReward: 25, goldReward: 18 }
    ents['21,59'] = { type: '🧟', name: 'Crypt Zombie', category: 'enemy', hp: 60, maxHp: 60, attack: 11, defense: 5, xpReward: 30, goldReward: 22 }
    ents['32,61'] = { type: '💰', name: 'Mimic', category: 'enemy', hp: 70, maxHp: 70, attack: 13, defense: 6, xpReward: 38, goldReward: 50 }
    ents['45,60'] = { type: '👻', name: 'Vault Ghost', category: 'enemy', hp: 65, maxHp: 65, attack: 12, defense: 5, xpReward: 35, goldReward: 28 }
    ents['48,62'] = { type: '💎', name: 'Crystal Golem', category: 'enemy', hp: 90, maxHp: 90, attack: 17, defense: 12, xpReward: 50, goldReward: 60 }
    ents['60,61'] = { type: '🔮', name: 'Evil Orb', category: 'enemy', hp: 55, maxHp: 55, attack: 11, defense: 4, xpReward: 30, goldReward: 25 }

    // GROUND FLOOR - Level 3 (y:45-54)
    ents['7,50'] = { type: '🐀', name: 'Giant Rat', category: 'enemy', hp: 30, maxHp: 30, attack: 5, defense: 2, xpReward: 15, goldReward: 10 }
    ents['10,52'] = { type: '🐺', name: 'Guard Dog', category: 'enemy', hp: 45, maxHp: 45, attack: 8, defense: 3, xpReward: 22, goldReward: 16 }
    ents['22,50'] = { type: '👹', name: 'Goblin Scout', category: 'enemy', hp: 40, maxHp: 40, attack: 7, defense: 3, xpReward: 20, goldReward: 14 }
    ents['25,49'] = { type: '👹', name: 'Goblin Warrior', category: 'enemy', hp: 50, maxHp: 50, attack: 9, defense: 4, xpReward: 25, goldReward: 18 }
    ents['37,50'] = { type: '🧟', name: 'Hall Zombie', category: 'enemy', hp: 55, maxHp: 55, attack: 10, defense: 4, xpReward: 28, goldReward: 20 }
    ents['52,51'] = { type: '👻', name: 'Guest Ghost', category: 'enemy', hp: 50, maxHp: 50, attack: 9, defense: 3, xpReward: 26, goldReward: 19 }
    ents['65,50'] = { type: '🐴', name: 'Corrupted Horse', category: 'enemy', hp: 60, maxHp: 60, attack: 11, defense: 5, xpReward: 32, goldReward: 24 }

    // SECOND FLOOR - Level 4 (y:35-44)
    ents['5,40'] = { type: '🧟', name: 'Zombie Chef', category: 'enemy', hp: 60, maxHp: 60, attack: 11, defense: 5, xpReward: 32, goldReward: 24 }
    ents['8,39'] = { type: '🔪', name: 'Evil Cook', category: 'enemy', hp: 55, maxHp: 55, attack: 10, defense: 4, xpReward: 30, goldReward: 22 }
    ents['19,38'] = { type: '🦇', name: 'Vampire Bat', category: 'enemy', hp: 45, maxHp: 45, attack: 8, defense: 2, xpReward: 24, goldReward: 18 }
    ents['35,39'] = { type: '🍴', name: 'Living Cutlery', category: 'enemy', hp: 50, maxHp: 50, attack: 9, defense: 3, xpReward: 26, goldReward: 20 }
    ents['38,37'] = { type: '👻', name: 'Dining Phantom', category: 'enemy', hp: 65, maxHp: 65, attack: 13, defense: 5, xpReward: 35, goldReward: 26 }
    ents['52,40'] = { type: '🧹', name: 'Cursed Broom', category: 'enemy', hp: 40, maxHp: 40, attack: 7, defense: 2, xpReward: 22, goldReward: 16 }
    ents['68,39'] = { type: '🧺', name: 'Laundry Golem', category: 'enemy', hp: 70, maxHp: 70, attack: 14, defense: 6, xpReward: 38, goldReward: 28 }

    // THIRD FLOOR - Level 5 (y:25-34) - MILITARY
    ents['5,30'] = { type: '⚔️', name: 'Cursed Knight', category: 'enemy', hp: 90, maxHp: 90, attack: 18, defense: 12, xpReward: 50, goldReward: 40 }
    ents['8,31'] = { type: '🗡️', name: 'Blade Master', category: 'enemy', hp: 85, maxHp: 85, attack: 17, defense: 10, xpReward: 48, goldReward: 38 }
    ents['20,29'] = { type: '🛡️', name: 'Shield Guardian', category: 'enemy', hp: 100, maxHp: 100, attack: 16, defense: 15, xpReward: 55, goldReward: 45 }
    ents['23,30'] = { type: '🧌', name: 'Troll Berserker', category: 'enemy', hp: 110, maxHp: 110, attack: 22, defense: 10, xpReward: 60, goldReward: 50 }
    ents['37,28'] = { type: '👹', name: 'Orc Captain', category: 'enemy', hp: 95, maxHp: 95, attack: 19, defense: 9, xpReward: 52, goldReward: 42 }
    ents['40,30'] = { type: '🤺', name: 'Duel Master', category: 'enemy', hp: 90, maxHp: 90, attack: 20, defense: 8, xpReward: 50, goldReward: 40 }
    ents['54,29'] = { type: '🏹', name: 'Dark Archer', category: 'enemy', hp: 80, maxHp: 80, attack: 17, defense: 6, xpReward: 46, goldReward: 36 }
    ents['67,30'] = { type: '💀', name: 'Death Knight', category: 'enemy', hp: 120, maxHp: 120, attack: 24, defense: 14, xpReward: 68, goldReward: 58 }

    // FOURTH FLOOR - Level 6 (y:15-24) - LIBRARY & GREAT HALL
    ents['7,20'] = { type: '📚', name: 'Living Tome', category: 'enemy', hp: 70, maxHp: 70, attack: 15, defense: 5, xpReward: 40, goldReward: 32 }
    ents['24,19'] = { type: '📖', name: 'Spell Book', category: 'enemy', hp: 65, maxHp: 65, attack: 14, defense: 4, xpReward: 38, goldReward: 30 }
    ents['42,18'] = { type: '👻', name: 'Hall Wraith', category: 'enemy', hp: 90, maxHp: 90, attack: 19, defense: 7, xpReward: 52, goldReward: 42 }
    ents['45,20'] = { type: '💀', name: 'Bone Mage', category: 'enemy', hp: 95, maxHp: 95, attack: 20, defense: 8, xpReward: 55, goldReward: 45 }
    ents['62,19'] = { type: '🎵', name: 'Cursed Harp', category: 'enemy', hp: 75, maxHp: 75, attack: 16, defense: 6, xpReward: 42, goldReward: 34 }

    // FIFTH FLOOR - Level 7 (y:8-14) - CHAPEL & BALLROOM
    ents['6,11'] = { type: '👼', name: 'Fallen Angel', category: 'enemy', hp: 110, maxHp: 110, attack: 23, defense: 10, xpReward: 62, goldReward: 52 }
    ents['22,10'] = { type: '🕊️', name: 'Dark Seraph', category: 'enemy', hp: 120, maxHp: 120, attack: 25, defense: 11, xpReward: 68, goldReward: 58 }
    ents['41,10'] = { type: '💃', name: 'Ghost Dancer', category: 'enemy', hp: 85, maxHp: 85, attack: 18, defense: 7, xpReward: 48, goldReward: 38 }
    ents['44,11'] = { type: '🎭', name: 'Phantom Jester', category: 'enemy', hp: 90, maxHp: 90, attack: 19, defense: 8, xpReward: 50, goldReward: 40 }
    ents['70,11'] = { type: '🔭', name: 'Star Guardian', category: 'enemy', hp: 100, maxHp: 100, attack: 21, defense: 9, xpReward: 58, goldReward: 48 }

    // ROYAL FLOOR - Level 8 (y:0-7) - BOSSES
    ents['5,4'] = { type: '🧙‍♂️', name: 'Dark Archmage', category: 'enemy', hp: 140, maxHp: 140, attack: 28, defense: 13, xpReward: 85, goldReward: 75 }
    ents['7,3'] = { type: '✨', name: 'Chaos Wizard', category: 'enemy', hp: 130, maxHp: 130, attack: 27, defense: 12, xpReward: 80, goldReward: 70 }
    ents['18,3'] = { type: '👑', name: 'DARK LORD', category: 'enemy', hp: 250, maxHp: 250, attack: 35, defense: 18, xpReward: 250, goldReward: 200 }
    ents['21,4'] = { type: '😈', name: 'Shadow Demon', category: 'enemy', hp: 160, maxHp: 160, attack: 30, defense: 14, xpReward: 95, goldReward: 85 }
    ents['34,3'] = { type: '💰', name: 'Treasure Golem', category: 'enemy', hp: 170, maxHp: 170, attack: 29, defense: 16, xpReward: 100, goldReward: 150 }
    ents['36,4'] = { type: '💎', name: 'Diamond Elemental', category: 'enemy', hp: 150, maxHp: 150, attack: 28, defense: 15, xpReward: 90, goldReward: 120 }
    ents['48,3'] = { type: '👻', name: 'Royal Ghost', category: 'enemy', hp: 135, maxHp: 135, attack: 27, defense: 11, xpReward: 82, goldReward: 72 }
    ents['50,4'] = { type: '🦁', name: 'Spirit Lion', category: 'enemy', hp: 145, maxHp: 145, attack: 29, defense: 13, xpReward: 88, goldReward: 78 }
    ents['62,3'] = { type: '👑', name: 'Dark Queen', category: 'enemy', hp: 180, maxHp: 180, attack: 32, defense: 15, xpReward: 110, goldReward: 100 }

    // ============ WEAPONS ============
    // Basic Weapons (Ground Floor)
    ents['9,50'] = { type: '🗡️', name: 'Iron Sword', category: 'item', itemType: 'weapon', attack: 5, value: 30 }
    ents['12,49'] = { type: '🔪', name: 'Dagger', category: 'item', itemType: 'weapon', attack: 4, value: 25 }
    ents['65,51'] = { type: '🪓', name: 'Battle Axe', category: 'item', itemType: 'weapon', attack: 7, value: 40 }

    // Mid Tier (Floors 2-4)
    ents['7,39'] = { type: '⚔️', name: 'Steel Sword', category: 'item', itemType: 'weapon', attack: 10, value: 60 }
    ents['54,40'] = { type: '🗡️', name: 'Rapier', category: 'item', itemType: 'weapon', attack: 9, value: 55 }
    ents['6,30'] = { type: '⚔️', name: 'Knight Blade', category: 'item', itemType: 'weapon', attack: 13, value: 80 }
    ents['42,29'] = { type: '🔱', name: 'War Spear', category: 'item', itemType: 'weapon', attack: 12, value: 75 }
    ents['9,20'] = { type: '🏹', name: 'Longbow', category: 'item', itemType: 'weapon', attack: 11, value: 70 }
    ents['60,19'] = { type: '🏹', name: 'Crossbow', category: 'item', itemType: 'weapon', attack: 14, value: 85 }

    // High Tier (Floors 5-7)
    ents['38,30'] = { type: '⚔️', name: 'Flameblade', category: 'item', itemType: 'weapon', attack: 16, value: 110 }
    ents['24,20'] = { type: '🔱', name: 'Trident of Power', category: 'item', itemType: 'weapon', attack: 18, value: 130 }
    ents['43,11'] = { type: '⚔️', name: 'Holy Sword', category: 'item', itemType: 'weapon', attack: 20, value: 160 }
    ents['71,12'] = { type: '🏹', name: 'Star Bow', category: 'item', itemType: 'weapon', attack: 19, value: 150 }

    // Legendary (Royal Floor & Deep Basement)
    ents['6,3'] = { type: '⚔️', name: 'EXCALIBUR', category: 'item', itemType: 'weapon', attack: 30, value: 500 }
    ents['35,3'] = { type: '🔱', name: 'Poseidon Trident', category: 'item', itemType: 'weapon', attack: 28, value: 450 }
    ents['63,4'] = { type: '🏹', name: 'Divine Bow', category: 'item', itemType: 'weapon', attack: 27, value: 420 }
    ents['70,71'] = { type: '⚔️', name: 'Demon Slayer', category: 'item', itemType: 'weapon', attack: 32, value: 600 }

    // SECRET WEAPON - Only appears after learning castle history from Librarian
    // Hidden in secret chamber behind the library (x: 30, y: 20)
    ents['30,20'] = { type: '⚔️', name: 'BLADE OF ETERNITY', category: 'item', itemType: 'weapon', attack: 500, value: 9999, secret: true }

    // ============ ARMOR ============
    // Basic (Floors 1-3)
    ents['11,51'] = { type: '🛡️', name: 'Wooden Shield', category: 'item', itemType: 'armor', defense: 3, value: 25 }
    ents['24,50'] = { type: '🦺', name: 'Leather Armor', category: 'item', itemType: 'armor', defense: 4, value: 30 }
    ents['8,40'] = { type: '🛡️', name: 'Iron Shield', category: 'item', itemType: 'armor', defense: 6, value: 50 }

    // Mid Tier (Floors 3-5)
    ents['7,31'] = { type: '🛡️', name: 'Steel Shield', category: 'item', itemType: 'armor', defense: 8, value: 70 }
    ents['55,30'] = { type: '🦺', name: 'Chainmail', category: 'item', itemType: 'armor', defense: 10, value: 85 }
    ents['25,20'] = { type: '🛡️', name: 'Tower Shield', category: 'item', itemType: 'armor', defense: 12, value: 100 }

    // High Tier (Floors 6-7)
    ents['47,19'] = { type: '🦺', name: 'Plate Armor', category: 'item', itemType: 'armor', defense: 14, value: 130 }
    ents['8,11'] = { type: '🛡️', name: 'Holy Shield', category: 'item', itemType: 'armor', defense: 16, value: 160 }

    // Legendary (Royal Floor)
    ents['20,3'] = { type: '🛡️', name: 'Dragon Shield', category: 'item', itemType: 'armor', defense: 20, value: 300 }
    ents['49,3'] = { type: '🦺', name: 'Divine Armor', category: 'item', itemType: 'armor', defense: 22, value: 400 }

    // ============ POTIONS ============
    // Health Potions scattered across all floors
    ents['10,70'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }
    ents['50,70'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }
    ents['15,61'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }
    ents['55,60'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }
    ents['13,51'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }
    ents['40,50'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }
    ents['10,40'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }
    ents['50,39'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }
    ents['15,30'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }
    ents['58,29'] = { type: '❤️', name: 'Health Potion', category: 'item', itemType: 'consumable', healing: 30, value: 20 }

    // Mega Potions
    ents['35,71'] = { type: '💚', name: 'Mega Potion', category: 'item', itemType: 'consumable', healing: 60, value: 40 }
    ents['42,60'] = { type: '💚', name: 'Mega Potion', category: 'item', itemType: 'consumable', healing: 60, value: 40 }
    ents['28,51'] = { type: '💚', name: 'Mega Potion', category: 'item', itemType: 'consumable', healing: 60, value: 40 }
    ents['33,40'] = { type: '💚', name: 'Mega Potion', category: 'item', itemType: 'consumable', healing: 60, value: 40 }
    ents['28,30'] = { type: '💚', name: 'Mega Potion', category: 'item', itemType: 'consumable', healing: 60, value: 40 }
    ents['40,20'] = { type: '💚', name: 'Mega Potion', category: 'item', itemType: 'consumable', healing: 60, value: 40 }
    ents['25,11'] = { type: '💚', name: 'Mega Potion', category: 'item', itemType: 'consumable', healing: 60, value: 40 }

    // Ultra Potions (Rare)
    ents['60,71'] = { type: '💜', name: 'Ultra Potion', category: 'item', itemType: 'consumable', healing: 100, value: 70 }
    ents['45,61'] = { type: '💜', name: 'Ultra Potion', category: 'item', itemType: 'consumable', healing: 100, value: 70 }
    ents['32,20'] = { type: '💜', name: 'Ultra Potion', category: 'item', itemType: 'consumable', healing: 100, value: 70 }
    ents['55,11'] = { type: '💜', name: 'Ultra Potion', category: 'item', itemType: 'consumable', healing: 100, value: 70 }
    ents['38,4'] = { type: '💜', name: 'Ultra Potion', category: 'item', itemType: 'consumable', healing: 100, value: 70 }

    // ============ TREASURES ============
    ents['45,71'] = { type: '💎', name: 'Ruby', category: 'item', itemType: 'treasure', value: 100 }
    ents['55,61'] = { type: '💎', name: 'Sapphire', category: 'item', itemType: 'treasure', value: 120 }
    ents['47,60'] = { type: '💎', name: 'Emerald', category: 'item', itemType: 'treasure', value: 110 }
    ents['68,51'] = { type: '💰', name: 'Gold Chest', category: 'item', itemType: 'treasure', value: 150 }
    ents['64,40'] = { type: '🏺', name: 'Ancient Vase', category: 'item', itemType: 'treasure', value: 80 }
    ents['32,21'] = { type: '📚', name: 'Rare Tome', category: 'item', itemType: 'treasure', value: 140 }
    ents['58,12'] = { type: '🎨', name: 'Masterpiece', category: 'item', itemType: 'treasure', value: 180 }
    ents['19,4'] = { type: '👑', name: 'Royal Crown', category: 'item', itemType: 'treasure', value: 300 }
    ents['37,3'] = { type: '🔮', name: 'Crystal Orb', category: 'item', itemType: 'treasure', value: 250 }
    ents['72,3'] = { type: '⭐', name: 'Sacred Star', category: 'item', itemType: 'treasure', value: 500 }

    // ============ FURNITURE (200+ pieces for realism!) ============

    // DEEP BASEMENT - Level 1 (Prison/Dungeon themed)
    ents['4,69'] = { type: '⛓️', name: 'Wall Chains', category: 'furniture' }
    ents['6,70'] = { type: '🔒', name: 'Iron Bars', category: 'furniture' }
    ents['7,72'] = { type: '🪨', name: 'Stone Block', category: 'furniture' }
    ents['16,69'] = { type: '⛓️', name: 'Shackles', category: 'furniture' }
    ents['19,71'] = { type: '🔒', name: 'Cell Door', category: 'furniture' }
    ents['22,70'] = { type: '🪑', name: 'Old Stool', category: 'furniture' }
    ents['29,70'] = { type: '🪨', name: 'Torture Rack', category: 'furniture' }
    ents['31,72'] = { type: '⛓️', name: 'Hanging Chains', category: 'furniture' }
    ents['34,71'] = { type: '🕯️', name: 'Dim Torch', category: 'furniture' }
    ents['41,69'] = { type: '💀', name: 'Skull Pile', category: 'furniture' }
    ents['43,72'] = { type: '🪦', name: 'Tomb', category: 'furniture' }
    ents['47,70'] = { type: '⚰️', name: 'Coffin', category: 'furniture' }
    ents['55,70'] = { type: '🪦', name: 'Grave Marker', category: 'furniture' }
    ents['57,72'] = { type: '💀', name: 'Bones', category: 'furniture' }
    ents['67,69'] = { type: '🏺', name: 'Ancient Urn', category: 'furniture' }
    ents['70,72'] = { type: '📦', name: 'Sealed Crate', category: 'furniture' }

    // BASEMENT - Level 2 (Storage/Vault themed)
    ents['4,59'] = { type: '📦', name: 'Large Crate', category: 'furniture' }
    ents['7,61'] = { type: '🛢️', name: 'Wine Barrel', category: 'furniture' }
    ents['10,60'] = { type: '📦', name: 'Stacked Boxes', category: 'furniture' }
    ents['17,58'] = { type: '🛢️', name: 'Storage Barrel', category: 'furniture' }
    ents['20,62'] = { type: '📦', name: 'Supply Crate', category: 'furniture' }
    ents['22,59'] = { type: '🧺', name: 'Storage Basket', category: 'furniture' }
    ents['30,60'] = { type: '🍷', name: 'Wine Rack', category: 'furniture' }
    ents['33,62'] = { type: '🛢️', name: 'Ale Keg', category: 'furniture' }
    ents['43,59'] = { type: '💰', name: 'Coin Stack', category: 'furniture' }
    ents['46,61'] = { type: '💎', name: 'Gem Display', category: 'furniture' }
    ents['49,60'] = { type: '🏺', name: 'Treasure Pot', category: 'furniture' }
    ents['58,59'] = { type: '🕯️', name: 'Wall Torch', category: 'furniture' }
    ents['62,62'] = { type: '🗝️', name: 'Key Rack', category: 'furniture' }

    // GROUND FLOOR - Level 3 (Entrance/Living spaces)
    ents['5,50'] = { type: '🪑', name: 'Bench', category: 'furniture' }
    ents['7,52'] = { type: '🕯️', name: 'Grand Candelabra', category: 'furniture' }
    ents['10,50'] = { type: '🎨', name: 'Portrait', category: 'furniture' }
    ents['12,51'] = { type: '🪴', name: 'Potted Plant', category: 'furniture' }
    ents['4,46'] = { type: '🪪', name: 'Armor Stand', category: 'furniture' }
    ents['6,47'] = { type: '🗡️', name: 'Weapon Display', category: 'furniture' }
    ents['8,46'] = { type: '🪑', name: 'Guard Chair', category: 'furniture' }
    ents['20,50'] = { type: '🛏️', name: 'Servant Bed', category: 'furniture' }
    ents['23,51'] = { type: '🪑', name: 'Wood Chair', category: 'furniture' }
    ents['25,49'] = { type: '🧺', name: 'Laundry Basket', category: 'furniture' }
    ents['35,49'] = { type: '🕯️', name: 'Wall Sconce', category: 'furniture' }
    ents['38,51'] = { type: '🏛️', name: 'Stone Pillar', category: 'furniture' }
    ents['41,50'] = { type: '🎨', name: 'Tapestry', category: 'furniture' }
    ents['50,50'] = { type: '🪑', name: 'Guest Chair', category: 'furniture' }
    ents['53,52'] = { type: '🛏️', name: 'Guest Bed', category: 'furniture' }
    ents['63,49'] = { type: '🐴', name: 'Hay Pile', category: 'furniture' }
    ents['66,51'] = { type: '🛢️', name: 'Water Trough', category: 'furniture' }
    ents['69,50'] = { type: '🧹', name: 'Broom', category: 'furniture' }

    // SECOND FLOOR - Level 4 (Kitchen/Dining)
    ents['4,39'] = { type: '🔥', name: 'Cooking Fire', category: 'furniture' }
    ents['6,41'] = { type: '🍳', name: 'Counter', category: 'furniture' }
    ents['8,40'] = { type: '🧺', name: 'Food Basket', category: 'furniture' }
    ents['10,42'] = { type: '🍞', name: 'Bread Oven', category: 'furniture' }
    ents['17,38'] = { type: '📦', name: 'Pantry Shelf', category: 'furniture' }
    ents['19,39'] = { type: '🛢️', name: 'Flour Barrel', category: 'furniture' }
    ents['21,41'] = { type: '🧺', name: 'Vegetable Basket', category: 'furniture' }
    ents['30,37'] = { type: '🍽️', name: 'Dining Table', category: 'furniture' }
    ents['32,39'] = { type: '🪑', name: 'Dining Chair', category: 'furniture' }
    ents['35,38'] = { type: '🪑', name: 'Dining Chair', category: 'furniture' }
    ents['37,40'] = { type: '🪑', name: 'Dining Chair', category: 'furniture' }
    ents['40,37'] = { type: '🕯️', name: 'Chandelier', category: 'furniture' }
    ents['42,39'] = { type: '🍷', name: 'Wine Cabinet', category: 'furniture' }
    ents['50,39'] = { type: '🛏️', name: 'Servant Cot', category: 'furniture' }
    ents['53,41'] = { type: '🪑', name: 'Stool', category: 'furniture' }
    ents['55,40'] = { type: '🧺', name: 'Clothes Basket', category: 'furniture' }
    ents['65,38'] = { type: '🧹', name: 'Cleaning Tools', category: 'furniture' }
    ents['67,40'] = { type: '🛢️', name: 'Wash Basin', category: 'furniture' }

    // THIRD FLOOR - Level 5 (Military/Training)
    ents['4,29'] = { type: '🪪', name: 'Armor Stand', category: 'furniture' }
    ents['6,31'] = { type: '🗡️', name: 'Weapon Rack', category: 'furniture' }
    ents['8,30'] = { type: '🛡️', name: 'Shield Wall', category: 'furniture' }
    ents['10,32'] = { type: '🪪', name: 'Full Armor Display', category: 'furniture' }
    ents['18,28'] = { type: '🛏️', name: 'Bunk Bed', category: 'furniture' }
    ents['20,30'] = { type: '🛏️', name: 'Bunk Bed', category: 'furniture' }
    ents['22,29'] = { type: '🧳', name: 'Footlocker', category: 'furniture' }
    ents['24,31'] = { type: '🪑', name: 'Soldier Chair', category: 'furniture' }
    ents['34,27'] = { type: '🎯', name: 'Target Dummy', category: 'furniture' }
    ents['37,29'] = { type: '🪨', name: 'Training Weight', category: 'furniture' }
    ents['40,28'] = { type: '🎯', name: 'Archery Target', category: 'furniture' }
    ents['43,30'] = { type: '🏋️', name: 'Exercise Bench', category: 'furniture' }
    ents['52,29'] = { type: '🛏️', name: 'Officer Bed', category: 'furniture' }
    ents['54,31'] = { type: '🪑', name: 'Officer Chair', category: 'furniture' }
    ents['56,30'] = { type: '📜', name: 'Battle Map', category: 'furniture' }
    ents['66,28'] = { type: '📜', name: 'War Plans', category: 'furniture' }
    ents['68,30'] = { type: '🗺️', name: 'Strategy Table', category: 'furniture' }
    ents['71,29'] = { type: '🕯️', name: 'War Candle', category: 'furniture' }

    // FOURTH FLOOR - Level 6 (Library/Great Hall)
    ents['4,19'] = { type: '📚', name: 'Bookshelf', category: 'furniture' }
    ents['6,21'] = { type: '📚', name: 'Book Stack', category: 'furniture' }
    ents['8,20'] = { type: '🪑', name: 'Reading Chair', category: 'furniture' }
    ents['10,22'] = { type: '📖', name: 'Desk', category: 'furniture' }
    ents['20,19'] = { type: '📚', name: 'Tall Bookshelf', category: 'furniture' }
    ents['22,21'] = { type: '📚', name: 'Ancient Scrolls', category: 'furniture' }
    ents['25,20'] = { type: '🕯️', name: 'Reading Lamp', category: 'furniture' }
    ents['28,22'] = { type: '📖', name: 'Writing Desk', category: 'furniture' }
    ents['38,17'] = { type: '🏛️', name: 'Grand Pillar', category: 'furniture' }
    ents['42,19'] = { type: '🏛️', name: 'Stone Column', category: 'furniture' }
    ents['45,18'] = { type: '🪑', name: 'Noble Chair', category: 'furniture' }
    ents['48,20'] = { type: '🎨', name: 'Large Painting', category: 'furniture' }
    ents['51,19'] = { type: '🕯️', name: 'Crystal Chandelier', category: 'furniture' }
    ents['60,19'] = { type: '🎹', name: 'Grand Piano', category: 'furniture' }
    ents['63,21'] = { type: '🎵', name: 'Harp', category: 'furniture' }
    ents['66,20'] = { type: '🪑', name: 'Music Stool', category: 'furniture' }

    // FIFTH FLOOR - Level 7 (Chapel/Ballroom)
    ents['4,10'] = { type: '⛪', name: 'Small Altar', category: 'furniture' }
    ents['6,11'] = { type: '🕯️', name: 'Altar Candles', category: 'furniture' }
    ents['8,10'] = { type: '🪑', name: 'Pew', category: 'furniture' }
    ents['10,12'] = { type: '🪑', name: 'Prayer Bench', category: 'furniture' }
    ents['18,10'] = { type: '⛪', name: 'Grand Altar', category: 'furniture' }
    ents['20,11'] = { type: '🕯️', name: 'Holy Candles', category: 'furniture' }
    ents['23,10'] = { type: '🪑', name: 'Chapel Pew', category: 'furniture' }
    ents['26,12'] = { type: '📿', name: 'Prayer Beads', category: 'furniture' }
    ents['28,11'] = { type: '🔔', name: 'Chapel Bell', category: 'furniture' }
    ents['37,9'] = { type: '💃', name: 'Dance Floor', category: 'furniture' }
    ents['40,11'] = { type: '🕯️', name: 'Ball Chandelier', category: 'furniture' }
    ents['43,10'] = { type: '🎨', name: 'Masterpiece', category: 'furniture' }
    ents['46,12'] = { type: '🪑', name: 'Throne Chair', category: 'furniture' }
    ents['56,11'] = { type: '🎨', name: 'Gallery Art', category: 'furniture' }
    ents['59,10'] = { type: '🏺', name: 'Decorative Vase', category: 'furniture' }
    ents['62,12'] = { type: '🪴', name: 'Plant Display', category: 'furniture' }
    ents['70,10'] = { type: '🔭', name: 'Telescope', category: 'furniture' }
    ents['72,12'] = { type: '🌟', name: 'Star Chart', category: 'furniture' }

    // ROYAL FLOOR - Level 8 (Luxury/Royal themed)
    ents['3,3'] = { type: '🧪', name: 'Potion Shelf', category: 'furniture' }
    ents['4,4'] = { type: '⚗️', name: 'Alchemy Cauldron', category: 'furniture' }
    ents['6,3'] = { type: '📜', name: 'Spell Scrolls', category: 'furniture' }
    ents['7,4'] = { type: '🔮', name: 'Scrying Orb', category: 'furniture' }
    ents['8,3'] = { type: '✨', name: 'Magic Circle', category: 'furniture' }
    ents['16,2'] = { type: '🏛️', name: 'Royal Pillar', category: 'furniture' }
    ents['19,3'] = { type: '👑', name: 'Grand Throne', category: 'furniture' }
    ents['22,2'] = { type: '🏛️', name: 'Marble Column', category: 'furniture' }
    ents['24,4'] = { type: '🕯️', name: 'Golden Candelabra', category: 'furniture' }
    ents['32,3'] = { type: '💎', name: 'Gem Pedestal', category: 'furniture' }
    ents['34,4'] = { type: '💰', name: 'Gold Display', category: 'furniture' }
    ents['36,3'] = { type: '🏺', name: 'Royal Vase', category: 'furniture' }
    ents['46,2'] = { type: '🛏️', name: 'Royal Bed', category: 'furniture' }
    ents['48,4'] = { type: '🪑', name: 'Luxury Chair', category: 'furniture' }
    ents['51,3'] = { type: '🎨', name: 'Royal Portrait', category: 'furniture' }
    ents['60,3'] = { type: '🛏️', name: 'Queen Bed', category: 'furniture' }
    ents['62,4'] = { type: '💄', name: 'Vanity', category: 'furniture' }
    ents['64,3'] = { type: '👗', name: 'Wardrobe', category: 'furniture' }
    ents['71,2'] = { type: '🕯️', name: 'Dark Candle', category: 'furniture' }
    ents['72,4'] = { type: '📜', name: 'Ancient Text', category: 'furniture' }
    ents['14,7'] = { type: '🎨', name: 'Royal Portrait', category: 'furniture' }
    ents['18,7'] = { type: '🎨', name: 'Royal Portrait', category: 'furniture' }

    // Treasury
    ents['23,3'] = { type: '🏺', name: 'Golden Vase', category: 'furniture' }
    ents['23,5'] = { type: '💰', name: 'Coin Chest', category: 'furniture' }
    ents['24,7'] = { type: '💍', name: 'Jewelry Box', category: 'furniture' }
    ents['27,3'] = { type: '🏆', name: 'Trophy Display', category: 'furniture' }
    ents['27,6'] = { type: '👑', name: 'Crown Pedestal', category: 'furniture' }

    // Secret Chamber
    ents['1,2'] = { type: '🕯️', name: 'Dark Candle', category: 'furniture' }

    // ============ FLOOR DECORATIONS (100+ pieces) ============
    // These are decorative floor tiles that you can walk over

    // DEEP BASEMENT - Dirt, grime, blood
    ents['5,71'] = { type: '🟫', name: 'Dirt Patch', category: 'floor' }
    ents['11,70'] = { type: '💧', name: 'Water Puddle', category: 'floor' }
    ents['17,72'] = { type: '🩸', name: 'Blood Stain', category: 'floor' }
    ents['23,71'] = { type: '🟫', name: 'Muddy Floor', category: 'floor' }
    ents['32,72'] = { type: '💧', name: 'Dripping Water', category: 'floor' }
    ents['42,70'] = { type: '🩸', name: 'Old Blood', category: 'floor' }
    ents['51,71'] = { type: '🟫', name: 'Dirt', category: 'floor' }
    ents['61,72'] = { type: '💧', name: 'Puddle', category: 'floor' }

    // BASEMENT - Stone tiles, cracks
    ents['5,60'] = { type: '🟫', name: 'Stone Tile', category: 'floor' }
    ents['12,61'] = { type: '🪨', name: 'Cracked Stone', category: 'floor' }
    ents['25,60'] = { type: '🟫', name: 'Floor Tile', category: 'floor' }
    ents['38,61'] = { type: '🪨', name: 'Broken Tile', category: 'floor' }
    ents['52,60'] = { type: '🟫', name: 'Stone Floor', category: 'floor' }

    // GROUND FLOOR - Simple rugs, mats
    ents['6,51'] = { type: '🟫', name: 'Welcome Mat', category: 'floor' }
    ents['9,52'] = { type: '🟥', name: 'Red Runner Rug', category: 'floor' }
    ents['11,50'] = { type: '🟥', name: 'Entrance Carpet', category: 'floor' }
    ents['5,47'] = { type: '🟫', name: 'Guard Mat', category: 'floor' }
    ents['21,51'] = { type: '🟦', name: 'Blue Rug', category: 'floor' }
    ents['26,50'] = { type: '🟫', name: 'Floor Mat', category: 'floor' }
    ents['36,50'] = { type: '🟪', name: 'Purple Rug', category: 'floor' }
    ents['39,52'] = { type: '🟫', name: 'Hall Runner', category: 'floor' }
    ents['51,51'] = { type: '🟦', name: 'Guest Rug', category: 'floor' }
    ents['64,50'] = { type: '🌿', name: 'Hay Strands', category: 'floor' }
    ents['67,52'] = { type: '🌿', name: 'Straw', category: 'floor' }

    // SECOND FLOOR - Kitchen tiles, dining carpets
    ents['5,41'] = { type: '🟫', name: 'Kitchen Tile', category: 'floor' }
    ents['7,40'] = { type: '🟫', name: 'Stone Tile', category: 'floor' }
    ents['18,40'] = { type: '🟫', name: 'Pantry Floor', category: 'floor' }
    ents['29,38'] = { type: '🟥', name: 'Dining Carpet', category: 'floor' }
    ents['31,40'] = { type: '🟥', name: 'Red Rug', category: 'floor' }
    ents['34,39'] = { type: '🟥', name: 'Table Rug', category: 'floor' }
    ents['36,37'] = { type: '🟥', name: 'Grand Carpet', category: 'floor' }
    ents['39,39'] = { type: '🟥', name: 'Dining Runner', category: 'floor' }
    ents['51,40'] = { type: '🟫', name: 'Servant Mat', category: 'floor' }
    ents['66,39'] = { type: '💧', name: 'Wet Floor', category: 'floor' }

    // THIRD FLOOR - Military mats, training floor
    ents['5,30'] = { type: '🟫', name: 'Armory Mat', category: 'floor' }
    ents['9,31'] = { type: '🟫', name: 'Weapon Floor', category: 'floor' }
    ents['19,29'] = { type: '🟦', name: 'Barrack Rug', category: 'floor' }
    ents['21,31'] = { type: '🟫', name: 'Footlocker Mat', category: 'floor' }
    ents['35,28'] = { type: '🟩', name: 'Training Mat', category: 'floor' }
    ents['38,30'] = { type: '🟩', name: 'Exercise Floor', category: 'floor' }
    ents['41,29'] = { type: '🟩', name: 'Practice Mat', category: 'floor' }
    ents['53,30'] = { type: '🟦', name: 'Officer Rug', category: 'floor' }
    ents['67,29'] = { type: '🟫', name: 'War Room Mat', category: 'floor' }

    // FOURTH FLOOR - Library carpets, hall rugs
    ents['5,20'] = { type: '🟫', name: 'Study Rug', category: 'floor' }
    ents['7,21'] = { type: '🟫', name: 'Reading Mat', category: 'floor' }
    ents['21,20'] = { type: '🟫', name: 'Library Carpet', category: 'floor' }
    ents['24,21'] = { type: '🟫', name: 'Book Room Rug', category: 'floor' }
    ents['39,18'] = { type: '🟥', name: 'Grand Hall Carpet', category: 'floor' }
    ents['42,20'] = { type: '🟥', name: 'Red Runner', category: 'floor' }
    ents['46,19'] = { type: '🟥', name: 'Hall Rug', category: 'floor' }
    ents['49,21'] = { type: '🟪', name: 'Noble Carpet', category: 'floor' }
    ents['61,20'] = { type: '🟦', name: 'Music Room Rug', category: 'floor' }

    // FIFTH FLOOR - Sacred carpets, ballroom floor
    ents['5,11'] = { type: '🟪', name: 'Prayer Rug', category: 'floor' }
    ents['7,10'] = { type: '🟪', name: 'Chapel Mat', category: 'floor' }
    ents['19,11'] = { type: '🟪', name: 'Sacred Carpet', category: 'floor' }
    ents['21,10'] = { type: '🟪', name: 'Altar Rug', category: 'floor' }
    ents['24,12'] = { type: '🟪', name: 'Holy Runner', category: 'floor' }
    ents['38,10'] = { type: '⬜', name: 'Marble Tile', category: 'floor' }
    ents['41,12'] = { type: '⬜', name: 'Ballroom Floor', category: 'floor' }
    ents['44,11'] = { type: '⬜', name: 'Dance Tile', category: 'floor' }
    ents['47,10'] = { type: '⬜', name: 'Polished Marble', category: 'floor' }
    ents['57,11'] = { type: '🟫', name: 'Gallery Mat', category: 'floor' }
    ents['71,11'] = { type: '🟫', name: 'Observatory Floor', category: 'floor' }

    // ROYAL FLOOR - Luxury carpets, golden rugs
    ents['4,3'] = { type: '🟪', name: 'Magic Rug', category: 'floor' }
    ents['6,4'] = { type: '🟪', name: 'Wizard Carpet', category: 'floor' }
    ents['17,3'] = { type: '🟥', name: 'Throne Carpet', category: 'floor' }
    ents['20,4'] = { type: '🟥', name: 'Royal Red Carpet', category: 'floor' }
    ents['23,3'] = { type: '🟥', name: 'Regal Runner', category: 'floor' }
    ents['33,3'] = { type: '🟨', name: 'Golden Rug', category: 'floor' }
    ents['35,4'] = { type: '🟨', name: 'Treasure Carpet', category: 'floor' }
    ents['47,3'] = { type: '🟥', name: 'Chamber Carpet', category: 'floor' }
    ents['50,4'] = { type: '🟪', name: 'Luxury Rug', category: 'floor' }
    ents['61,3'] = { type: '🟪', name: 'Queen Carpet', category: 'floor' }
    ents['63,4'] = { type: '🟪', name: 'Royal Rug', category: 'floor' }

    // HALLWAYS - Runners throughout
    ents['37,15'] = { type: '🟫', name: 'Hall Runner', category: 'floor' }
    ents['37,25'] = { type: '🟫', name: 'Corridor Mat', category: 'floor' }
    ents['37,35'] = { type: '🟫', name: 'Passage Rug', category: 'floor' }
    ents['37,45'] = { type: '🟫', name: 'Hallway Runner', category: 'floor' }
    ents['37,55'] = { type: '🟫', name: 'Corridor Runner', category: 'floor' }
    ents['37,65'] = { type: '🟫', name: 'Hall Mat', category: 'floor' }

    // OUTDOOR/COURTYARD (if any open spaces)
    ents['42,17'] = { type: '🌿', name: 'Grass Patch', category: 'floor' }
    ents['45,17'] = { type: '🌿', name: 'Green Grass', category: 'floor' }
    ents['48,17'] = { type: '🌱', name: 'Small Plants', category: 'floor' }

    return ents
  })

  const getNextQuestion = () => {
    const difficulty = gameState.subjects[subject].difficulty
    const questions = getSessionQuestions(subject, gameState.player.grade, difficulty, 1)
    return questions[0]
  }

  const canMoveTo = (x, y) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false
    return castleMap[y][x] === TILE.FLOOR
  }

  const handleMove = (dx, dy) => {
    if (showCombat || showQuestion || showInventory || showNPC) return

    if (energy < 1) {
      setShowQuestion(true)
      setCurrentQuestion(getNextQuestion())
      return
    }

    const newX = player.x + dx
    const newY = player.y + dy

    if (!canMoveTo(newX, newY)) return

    setPlayer(prev => ({ ...prev, x: newX, y: newY }))
    setEnergy(energy - 1)

    // Check for interactions
    const posKey = `${newX},${newY}`
    const entity = entities[posKey]
    if (!entity) return

    // Hide secret items from interaction until revealed
    if (entity.secret && !secretRoomRevealed) return

    // Furniture and floor decorations are decorative only - can walk through them but not interact
    if (entity.category === 'furniture' || entity.category === 'floor') return

    if (entity.category === 'npc') {
      // Initialize reputation if not exists
      if (!npcReputation[entity.name]) {
        setNpcReputation(prev => ({ ...prev, [entity.name]: 0 }))
      }
      setCurrentNPC(entity)
      setNpcDialogueStage(0)
      setShowNPC(true)
    } else if (entity.category === 'enemy' && !defeatedEnemies.has(posKey)) {
      startCombat(entity, posKey)
    } else if (entity.category === 'item' && !collectedItems.has(posKey)) {
      collectItem(entity, posKey)
    }
  }

  const startCombat = (enemy, posKey) => {
    setCurrentEnemy({ ...enemy, posKey })
    setShowCombat(true)
    setCombatLog([`A wild ${enemy.name} appears!`])
  }

  const playerAttack = () => {
    const weapon = player.equipped.weapon
    const weaponBonus = weapon?.attack || 0
    const totalAttack = player.attack + weaponBonus
    const damage = Math.max(1, totalAttack - currentEnemy.defense)

    // Determine weapon type for animation
    let weaponType = 'fist'
    let weaponEmoji = '👊'
    let attackColor = 'text-white'

    if (weapon) {
      if (weapon.name.includes('Sword') || weapon.name.includes('Blade') || weapon.name.includes('Excalibur')) {
        weaponType = 'sword'
        weaponEmoji = '⚔️'
        attackColor = 'text-blue-400'
      } else if (weapon.name.includes('Bow')) {
        weaponType = 'bow'
        weaponEmoji = '🏹'
        attackColor = 'text-green-400'
      } else if (weapon.name.includes('Trident')) {
        weaponType = 'trident'
        weaponEmoji = '🔱'
        attackColor = 'text-cyan-400'
      } else if (weapon.name.includes('Excalibur')) {
        weaponType = 'legendary'
        weaponEmoji = '✨⚔️✨'
        attackColor = 'text-yellow-400'
      }
    }

    // Trigger attack animation
    setAttackAnimation({ type: 'player', weaponType, weaponEmoji, color: attackColor })

    // Create damage effect particles
    const effects = []
    for (let i = 0; i < damage; i++) {
      effects.push({
        id: Math.random(),
        x: 50 + Math.random() * 30,
        y: 20 + Math.random() * 30,
        damage: 1
      })
    }
    setAttackEffect(effects)

    // Clear animations after delay
    setTimeout(() => {
      setAttackAnimation(null)
      setAttackEffect([])
    }, 800)

    const newEnemyHp = Math.max(0, currentEnemy.hp - damage)
    setCurrentEnemy(prev => ({ ...prev, hp: newEnemyHp }))
    setCombatLog(prev => [...prev, `You attack with ${weapon?.name || 'Fist'} for ${damage} damage!`])

    if (newEnemyHp <= 0) {
      setTimeout(() => endCombat(true), 1500)
    } else {
      setTimeout(enemyAttack, 1500)
    }
  }

  const enemyAttack = () => {
    const armorBonus = player.equipped.armor?.defense || 0
    const totalDefense = player.defense + armorBonus
    const damage = Math.max(1, currentEnemy.attack - totalDefense)

    // Trigger enemy attack animation
    setAttackAnimation({ type: 'enemy', weaponEmoji: currentEnemy.type, color: 'text-red-500' })

    // Create damage effect particles on player
    const effects = []
    for (let i = 0; i < damage; i++) {
      effects.push({
        id: Math.random(),
        x: 20 + Math.random() * 30,
        y: 20 + Math.random() * 30,
        damage: 1
      })
    }
    setAttackEffect(effects)

    // Clear animations after delay
    setTimeout(() => {
      setAttackAnimation(null)
      setAttackEffect([])
    }, 800)

    setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }))
    setCombatLog(prev => [...prev, `${currentEnemy.name} attacks for ${damage} damage!`])

    if (player.hp - damage <= 0) {
      setTimeout(() => handlePlayerDefeat(), 1500)
    }
  }

  const endCombat = (victory) => {
    if (victory) {
      setCombatLog(prev => [...prev, `Victory! +${currentEnemy.xpReward} XP, +${currentEnemy.goldReward} Gold`])
      setDefeatedEnemies(prev => new Set([...prev, currentEnemy.posKey]))

      // Update quest progress for "defeat enemies" quests
      setActiveQuests(prev => prev.map(quest => {
        if (quest.description.toLowerCase().includes('defeat') || quest.description.toLowerCase().includes('enemy')) {
          return { ...quest, progress: quest.progress + 1 }
        }
        return quest
      }))

      setPlayer(prev => {
        const newXp = prev.xp + currentEnemy.xpReward
        const newGold = prev.gold + currentEnemy.goldReward
        const xpNeeded = prev.level * 100

        if (newXp >= xpNeeded) {
          setTimeout(() => {
            alert(`🎉 LEVEL UP! You are now level ${prev.level + 1}!\n+10 Max HP, +5 Attack, +2 Defense`)
          }, 1500)
          return {
            ...prev,
            level: prev.level + 1,
            xp: newXp - xpNeeded,
            maxHp: prev.maxHp + 10,
            hp: prev.maxHp + 10,
            attack: prev.attack + 5,
            defense: prev.defense + 2,
            gold: newGold
          }
        }

        return { ...prev, xp: newXp, gold: newGold }
      })
    }

    setTimeout(() => {
      setShowCombat(false)
      setCurrentEnemy(null)
      setCombatLog([])
    }, 2000)
  }

  const handlePlayerDefeat = () => {
    setCombatLog(prev => [...prev, `You were defeated! Returning to entrance...`])
    setTimeout(() => {
      setPlayer(prev => ({
        ...prev,
        x: 8,
        y: 51,
        hp: prev.maxHp
      }))
      setShowCombat(false)
      setCurrentEnemy(null)
      setCombatLog([])
    }, 2000)
  }

  const collectItem = (item, posKey) => {
    setCollectedItems(prev => new Set([...prev, posKey]))

    if (item.itemType === 'treasure') {
      setPlayer(prev => ({ ...prev, gold: prev.gold + item.value }))
      alert(`✨ Found ${item.name}! +${item.value} Gold`)
    } else {
      setPlayer(prev => ({
        ...prev,
        inventory: [...prev.inventory, { ...item, id: posKey }]
      }))
      alert(`📦 Collected ${item.name}!`)
    }
  }

  const useItem = (item) => {
    if (item.itemType === 'consumable' && item.healing) {
      setPlayer(prev => ({
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + item.healing),
        inventory: prev.inventory.filter(i => i.id !== item.id)
      }))
      alert(`❤️ Used ${item.name}! Restored ${item.healing} HP`)
      setShowInventory(false)
    } else if (item.itemType === 'weapon') {
      setPlayer(prev => {
        const unequipped = prev.equipped.weapon ? [prev.equipped.weapon] : []
        return {
          ...prev,
          equipped: { ...prev.equipped, weapon: item },
          inventory: [...prev.inventory.filter(i => i.id !== item.id), ...unequipped]
        }
      })
      alert(`⚔️ Equipped ${item.name}! +${item.attack} Attack`)
      setShowInventory(false)
    } else if (item.itemType === 'armor') {
      setPlayer(prev => {
        const unequipped = prev.equipped.armor ? [prev.equipped.armor] : []
        return {
          ...prev,
          equipped: { ...prev.equipped, armor: item },
          inventory: [...prev.inventory.filter(i => i.id !== item.id), ...unequipped]
        }
      })
      alert(`🛡️ Equipped ${item.name}! +${item.defense} Defense`)
      setShowInventory(false)
    }
  }

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentQuestion.correct

    if (isCorrect) {
      setEnergy(energy + 20)
      setFeedback({ type: 'correct', message: currentQuestion.explanation })

      // Update quest progress for "answer questions" quests
      setActiveQuests(prev => prev.map(quest => {
        if (quest.description.toLowerCase().includes('questions') || quest.description.toLowerCase().includes('answer')) {
          return { ...quest, progress: quest.progress + 1 }
        }
        return quest
      }))

      updateState(prev => {
        const newState = { ...prev }
        newState.subjects[subject].totalAnswered++
        newState.subjects[subject].totalCorrect++
        return newState
      })
    } else {
      setFeedback({ type: 'incorrect', message: `Not quite! ${currentQuestion.explanation}` })

      updateState(prev => {
        const newState = { ...prev }
        newState.subjects[subject].totalAnswered++
        return newState
      })
    }

    setTimeout(() => {
      setShowQuestion(false)
      setCurrentQuestion(null)
      setSelectedAnswer(null)
      setFeedback(null)
    }, 2000)
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showCombat || showQuestion || showInventory || showNPC) {
        if (e.key === 'i' || e.key === 'I') setShowInventory(false)
        return
      }

      if (e.key === 'ArrowUp') handleMove(0, -1)
      else if (e.key === 'ArrowDown') handleMove(0, 1)
      else if (e.key === 'ArrowLeft') handleMove(-1, 0)
      else if (e.key === 'ArrowRight') handleMove(1, 0)
      else if (e.key === 'q' || e.key === 'Q') {
        setShowQuestion(true)
        setCurrentQuestion(getNextQuestion())
      }
      else if (e.key === 'i' || e.key === 'I') setShowInventory(true)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [player, energy, showCombat, showQuestion, showInventory, showNPC])

  const getTileDisplay = (x, y) => {
    const posKey = `${x},${y}`

    // Player position
    if (x === player.x && y === player.y) {
      return { emoji: '🧙', color: 'bg-gradient-to-br from-slate-600 to-slate-700', border: 'ring-2 ring-amber-700', isWall: false }
    }

    // Check tile type
    const tileType = castleMap[y][x]

    if (tileType === TILE.WALL) {
      // Realistic stone walls - all natural gray/brown stone
      if (y >= 65) {
        // Deep basement - dark damp stone
        return { emoji: '', color: 'bg-gradient-to-br from-stone-950 to-gray-900', border: '', isWall: true }
      } else if (y >= 55) {
        // Basement - dark stone
        return { emoji: '', color: 'bg-gradient-to-br from-stone-900 to-gray-850', border: '', isWall: true }
      } else if (y >= 45) {
        // Ground floor - gray stone
        return { emoji: '', color: 'bg-gradient-to-br from-stone-800 to-gray-800', border: '', isWall: true }
      } else if (y >= 35) {
        // Second floor - lighter stone
        return { emoji: '', color: 'bg-gradient-to-br from-stone-700 to-gray-750', border: '', isWall: true }
      } else if (y >= 25) {
        // Third floor - medium stone
        return { emoji: '', color: 'bg-gradient-to-br from-stone-750 to-gray-700', border: '', isWall: true }
      } else if (y >= 15) {
        // Fourth floor - lighter stone
        return { emoji: '', color: 'bg-gradient-to-br from-stone-700 to-gray-650', border: '', isWall: true }
      } else if (y >= 8) {
        // Fifth floor - pale stone
        return { emoji: '', color: 'bg-gradient-to-br from-stone-650 to-gray-600', border: '', isWall: true }
      } else {
        // Royal floor - limestone/pale stone
        return { emoji: '', color: 'bg-gradient-to-br from-stone-600 to-gray-550', border: '', isWall: true }
      }
    }

    // Floor tile - check for entities
    const entity = entities[posKey]
    if (entity) {
      // Hide secret items until revealed
      if (entity.secret && !secretRoomRevealed) {
        // Show as empty floor
        if (y >= 15) return { emoji: '', color: 'bg-stone-700', border: '', isWall: false }
        else return { emoji: '', color: 'bg-stone-650', border: '', isWall: false }
      }

      if (entity.category === 'enemy' && defeatedEnemies.has(posKey)) {
        return { emoji: '💀', color: 'bg-gradient-to-br from-gray-800 to-stone-800', border: '', isWall: false }
      }
      if (collectedItems.has(posKey)) {
        // Different floor colors for different areas after collection
        if (y >= 25) return { emoji: '', color: 'bg-stone-700', border: '', isWall: false }
        else if (y >= 10) return { emoji: '', color: 'bg-amber-900', border: '', isWall: false }
        else return { emoji: '', color: 'bg-indigo-900', border: '', isWall: false }
      }

      // Colorful entity backgrounds
      let entityColor = 'bg-stone-600'

      if (entity.category === 'floor') {
        // Floor decoration colors - REALISTIC natural tones
        if (entity.type === '🟥') entityColor = 'bg-red-950/50'  // Dark burgundy carpets
        else if (entity.type === '🟦') entityColor = 'bg-slate-800/50'  // Faded blue-gray rugs
        else if (entity.type === '🟪') entityColor = 'bg-purple-950/50'  // Deep purple royal carpets
        else if (entity.type === '🟨') entityColor = 'bg-amber-900/50'  // Muted gold rugs
        else if (entity.type === '🟩') entityColor = 'bg-green-950/50'  // Dark green training mats
        else if (entity.type === '🟫') entityColor = 'bg-stone-800/50'  // Brown stone tiles
        else if (entity.type === '⬜') entityColor = 'bg-stone-400/40'  // Weathered marble
        else if (entity.type === '🌿') entityColor = 'bg-green-900/40'  // Dried grass/straw
        else if (entity.type === '🌱') entityColor = 'bg-green-950/35'  // Moss/plants
        else if (entity.type === '💧') entityColor = 'bg-slate-700/35'  // Murky water
        else if (entity.type === '🩸') entityColor = 'bg-red-950/60'  // Dark blood stains
        else if (entity.type === '🪨') entityColor = 'bg-gray-800/40'  // Cracked stone
        else entityColor = 'bg-stone-700/30'
      } else if (entity.category === 'furniture') {
        // Furniture colors - REALISTIC medieval materials
        if (entity.name.includes('Bench') || entity.name.includes('Chair') || entity.name.includes('Pew')) entityColor = 'bg-gradient-to-br from-amber-950 to-stone-900'  // Dark wood
        else if (entity.name.includes('Table') || entity.name.includes('Desk')) entityColor = 'bg-gradient-to-br from-amber-900 to-stone-900'  // Weathered wood
        else if (entity.name.includes('Candelabra') || entity.name.includes('Candle') || entity.name.includes('Lamp')) entityColor = 'bg-gradient-to-br from-amber-800 to-orange-900'  // Dim firelight
        else if (entity.name.includes('Bookshelf') || entity.name.includes('Book')) entityColor = 'bg-gradient-to-br from-amber-950 to-stone-950'  // Old wood shelves
        else if (entity.name.includes('Armor Stand') || entity.name.includes('Weapon Rack')) entityColor = 'bg-gradient-to-br from-gray-700 to-slate-800'  // Iron/steel
        else if (entity.name.includes('Bed')) entityColor = 'bg-gradient-to-br from-stone-800 to-gray-850'  // Stone bed frame/straw
        else if (entity.name.includes('Crate') || entity.name.includes('Barrel') || entity.name.includes('Chest')) entityColor = 'bg-gradient-to-br from-amber-950 to-stone-950'  // Old wood
        else if (entity.name.includes('Fire') || entity.name.includes('Cauldron')) entityColor = 'bg-gradient-to-br from-orange-900 to-red-950'  // Fire glow
        else if (entity.name.includes('Altar')) entityColor = 'bg-gradient-to-br from-stone-700 to-gray-750'  // Stone altar
        else if (entity.name.includes('Column')) entityColor = 'bg-gradient-to-br from-stone-650 to-gray-700'  // Stone pillars
        else if (entity.name.includes('Throne')) entityColor = 'bg-gradient-to-br from-amber-900 to-stone-800'  // Wooden throne
        else if (entity.name.includes('Golden') || entity.name.includes('Trophy') || entity.name.includes('Crown Pedestal')) entityColor = 'bg-gradient-to-br from-amber-800 to-yellow-900'  // Tarnished gold
        else if (entity.name.includes('Magic') || entity.name.includes('Crystal Ball') || entity.name.includes('Spell')) entityColor = 'bg-gradient-to-br from-slate-700 to-gray-800'  // Mystical items
        else if (entity.name.includes('Potion')) entityColor = 'bg-gradient-to-br from-green-950 to-emerald-950'  // Dark glass bottles
        else if (entity.name.includes('Dark')) entityColor = 'bg-gradient-to-br from-stone-950 to-black'  // Very dark
        else if (entity.name.includes('Painting') || entity.name.includes('Portrait')) entityColor = 'bg-gradient-to-br from-amber-950 to-stone-900'  // Old frames
        else if (entity.name.includes('Chains') || entity.name.includes('Bars')) entityColor = 'bg-gradient-to-br from-gray-800 to-slate-900'  // Rusty iron
        else entityColor = 'bg-gradient-to-br from-stone-800 to-gray-850'  // Default stone/wood
      } else if (entity.category === 'enemy') {
        // Enemy colors - subtle darker tones
        if (entity.name.includes('Rat')) entityColor = 'bg-gradient-to-br from-stone-800 to-gray-850'  // Dark brown rats
        else if (entity.name.includes('Goblin')) entityColor = 'bg-gradient-to-br from-green-950 to-stone-900'  // Muddy green
        else if (entity.name.includes('Zombie') || entity.name.includes('Phantom') || entity.name.includes('Wraith')) entityColor = 'bg-gradient-to-br from-slate-800 to-gray-900'  // Pale dead
        else if (entity.name.includes('Bat')) entityColor = 'bg-gradient-to-br from-gray-850 to-stone-900'  // Dark gray bats
        else if (entity.name.includes('Wolf')) entityColor = 'bg-gradient-to-br from-slate-850 to-gray-900'  // Gray wolves
        else if (entity.name.includes('Troll') || entity.name.includes('Orc')) entityColor = 'bg-gradient-to-br from-green-950 to-gray-900'  // Mossy green
        else if (entity.name.includes('Knight')) entityColor = 'bg-gradient-to-br from-slate-700 to-gray-800'  // Steel armor
        else if (entity.name.includes('Wizard')) entityColor = 'bg-gradient-to-br from-slate-800 to-stone-850'  // Dark robes
        else if (entity.name.includes('Dragon')) entityColor = 'bg-gradient-to-br from-red-950 to-stone-950'  // Dark red scales
        else if (entity.name.includes('Dark Lord')) entityColor = 'bg-gradient-to-br from-red-950 to-black'  // Nearly black
        else if (entity.name.includes('Demon')) entityColor = 'bg-gradient-to-br from-red-950 to-black'  // Pure darkness
        else entityColor = 'bg-gradient-to-br from-stone-850 to-gray-900'  // Default dark
      } else if (entity.category === 'npc') {
        // NPC colors - muted realistic clothing
        if (entity.name.includes('Princess')) entityColor = 'bg-gradient-to-br from-purple-900 to-pink-950'  // Royal purple dress
        else if (entity.name.includes('Wizard')) entityColor = 'bg-gradient-to-br from-slate-700 to-gray-800'  // Gray robes
        else if (entity.name.includes('Librarian')) entityColor = 'bg-gradient-to-br from-amber-950 to-stone-900'  // Brown scholar robes
        else if (entity.name.includes('Guard')) entityColor = 'bg-gradient-to-br from-slate-700 to-gray-800'  // Steel armor
        else if (entity.name.includes('Chef')) entityColor = 'bg-gradient-to-br from-stone-700 to-amber-950'  // Dirty apron
        else if (entity.name.includes('Priest')) entityColor = 'bg-gradient-to-br from-stone-800 to-gray-850'  // White/beige robes
        else if (entity.name.includes('Sage')) entityColor = 'bg-gradient-to-br from-stone-900 to-black'  // Dark robes
        else entityColor = 'bg-gradient-to-br from-slate-750 to-gray-800'  // Default clothing
      } else if (entity.category === 'item') {
        // Item colors by type
        if (entity.itemType === 'weapon') {
          if (entity.name.includes('BLADE OF ETERNITY')) entityColor = 'bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-400 shadow-2xl shadow-purple-500/80 animate-pulse'  // Ultimate weapon!
          else if (entity.name.includes('Excalibur')) entityColor = 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50'
          else if (entity.name.includes('Trident')) entityColor = 'bg-gradient-to-br from-cyan-600 to-blue-700'
          else if (entity.name.includes('Bow')) entityColor = 'bg-gradient-to-br from-green-600 to-emerald-700'
          else entityColor = 'bg-gradient-to-br from-gray-500 to-slate-600'
        } else if (entity.itemType === 'armor') {
          if (entity.name.includes('Dragon')) entityColor = 'bg-gradient-to-br from-red-600 to-orange-700'
          else if (entity.name.includes('Knight')) entityColor = 'bg-gradient-to-br from-blue-600 to-indigo-700'
          else entityColor = 'bg-gradient-to-br from-slate-600 to-gray-700'
        } else if (entity.itemType === 'consumable') {
          if (entity.name.includes('Ultra')) entityColor = 'bg-gradient-to-br from-purple-500 to-pink-600'
          else if (entity.name.includes('Mega')) entityColor = 'bg-gradient-to-br from-green-500 to-emerald-600'
          else entityColor = 'bg-gradient-to-br from-red-500 to-rose-600'
        } else if (entity.itemType === 'treasure') {
          if (entity.name.includes('Star')) entityColor = 'bg-gradient-to-br from-yellow-300 to-amber-400 shadow-lg shadow-yellow-400/50'
          else if (entity.name.includes('Crown')) entityColor = 'bg-gradient-to-br from-yellow-500 to-orange-600'
          else if (entity.name.includes('Ruby')) entityColor = 'bg-gradient-to-br from-red-500 to-rose-600'
          else if (entity.name.includes('Sapphire')) entityColor = 'bg-gradient-to-br from-blue-500 to-cyan-600'
          else if (entity.name.includes('Emerald')) entityColor = 'bg-gradient-to-br from-green-500 to-emerald-600'
          else if (entity.name.includes('Orb') || entity.name.includes('Crystal')) entityColor = 'bg-gradient-to-br from-purple-500 to-violet-600'
          else entityColor = 'bg-gradient-to-br from-amber-600 to-yellow-700'
        }
      }

      return {
        emoji: entity.type,
        color: entityColor,
        border: '',
        isWall: false
      }
    }

    // Empty floor - color by area/room (75x75 grid - 8 FLOORS!)
    // DEEP BASEMENT - Level 1 (y: 65-74)
    if (y >= 65) {
      if (x >= 3 && x <= 10 && y >= 68 && y <= 73) return { emoji: '', color: 'bg-gray-950', border: '', isWall: false }
      if (x >= 15 && x <= 23 && y >= 68 && y <= 73) return { emoji: '', color: 'bg-stone-950', border: '', isWall: false }
      if (x >= 28 && x <= 35 && y >= 69 && y <= 73) return { emoji: '', color: 'bg-red-950', border: '', isWall: false }
      if (x >= 40 && x <= 49 && y >= 68 && y <= 73) return { emoji: '', color: 'bg-purple-950', border: '', isWall: false }
      if (x >= 54 && x <= 62 && y >= 69 && y <= 73) return { emoji: '', color: 'bg-indigo-950', border: '', isWall: false }
      if (x >= 66 && x <= 72 && y >= 68 && y <= 73) return { emoji: '', color: 'bg-yellow-950', border: '', isWall: false }
      return { emoji: '', color: 'bg-black', border: '', isWall: false }
    }
    // BASEMENT - Level 2 (y: 55-64)
    else if (y >= 55) {
      if (x >= 2 && x <= 11 && y >= 58 && y <= 63) return { emoji: '', color: 'bg-gray-900', border: '', isWall: false }
      if (x >= 16 && x <= 23 && y >= 57 && y <= 63) return { emoji: '', color: 'bg-stone-900', border: '', isWall: false }
      if (x >= 28 && x <= 36 && y >= 58 && y <= 63) return { emoji: '', color: 'bg-purple-950', border: '', isWall: false }
      if (x >= 41 && x <= 52 && y >= 57 && y <= 63) return { emoji: '', color: 'bg-yellow-950', border: '', isWall: false }
      if (x >= 57 && x <= 66 && y >= 58 && y <= 63) return { emoji: '', color: 'bg-red-950', border: '', isWall: false }
      return { emoji: '', color: 'bg-stone-900', border: '', isWall: false }
    }
    // GROUND FLOOR - Level 3 (y: 45-54)
    else if (y >= 45) {
      if (x >= 3 && x <= 14 && y >= 49 && y <= 53) return { emoji: '', color: 'bg-stone-700', border: '', isWall: false }
      if (x >= 18 && x <= 27 && y >= 48 && y <= 53) return { emoji: '', color: 'bg-slate-700', border: '', isWall: false }
      if (x >= 32 && x <= 43 && y >= 47 && y <= 53) return { emoji: '', color: 'bg-amber-900', border: '', isWall: false }
      if (x >= 48 && x <= 57 && y >= 49 && y <= 53) return { emoji: '', color: 'bg-blue-950', border: '', isWall: false }
      if (x >= 62 && x <= 71 && y >= 48 && y <= 53) return { emoji: '', color: 'bg-green-950', border: '', isWall: false }
      return { emoji: '', color: 'bg-stone-600', border: '', isWall: false }
    }
    // SECOND FLOOR - Level 4 (y: 35-44)
    else if (y >= 35) {
      if (x >= 2 && x <= 11 && y >= 38 && y <= 43) return { emoji: '', color: 'bg-orange-900', border: '', isWall: false }
      if (x >= 16 && x <= 23 && y >= 37 && y <= 43) return { emoji: '', color: 'bg-amber-950', border: '', isWall: false }
      if (x >= 28 && x <= 43 && y >= 36 && y <= 43) return { emoji: '', color: 'bg-amber-900', border: '', isWall: false }
      if (x >= 48 && x <= 57 && y >= 38 && y <= 43) return { emoji: '', color: 'bg-slate-800', border: '', isWall: false }
      if (x >= 62 && x <= 71 && y >= 37 && y <= 43) return { emoji: '', color: 'bg-blue-950', border: '', isWall: false }
      return { emoji: '', color: 'bg-amber-800', border: '', isWall: false }
    }
    // THIRD FLOOR - Level 5 (y: 25-34)
    else if (y >= 25) {
      if (x >= 2 && x <= 11 && y >= 28 && y <= 33) return { emoji: '', color: 'bg-red-950', border: '', isWall: false }
      if (x >= 16 && x <= 27 && y >= 27 && y <= 33) return { emoji: '', color: 'bg-slate-800', border: '', isWall: false }
      if (x >= 32 && x <= 45 && y >= 26 && y <= 33) return { emoji: '', color: 'bg-green-950', border: '', isWall: false }
      if (x >= 50 && x <= 59 && y >= 28 && y <= 33) return { emoji: '', color: 'bg-blue-950', border: '', isWall: false }
      if (x >= 64 && x <= 72 && y >= 27 && y <= 33) return { emoji: '', color: 'bg-gray-800', border: '', isWall: false }
      return { emoji: '', color: 'bg-slate-700', border: '', isWall: false }
    }
    // FOURTH FLOOR - Level 6 (y: 15-24)
    else if (y >= 15) {
      if (x >= 2 && x <= 13 && y >= 18 && y <= 23) return { emoji: '', color: 'bg-amber-950', border: '', isWall: false }
      if (x >= 18 && x <= 31 && y >= 17 && y <= 23) return { emoji: '', color: 'bg-yellow-950', border: '', isWall: false }
      if (x >= 36 && x <= 53 && y >= 16 && y <= 23) return { emoji: '', color: 'bg-purple-950', border: '', isWall: false }
      if (x >= 58 && x <= 69 && y >= 18 && y <= 23) return { emoji: '', color: 'bg-indigo-950', border: '', isWall: false }
      return { emoji: '', color: 'bg-amber-900', border: '', isWall: false }
    }
    // FIFTH FLOOR - Level 7 (y: 8-14)
    else if (y >= 8) {
      if (x >= 2 && x <= 11 && y >= 10 && y <= 13) return { emoji: '', color: 'bg-indigo-950', border: '', isWall: false }
      if (x >= 16 && x <= 29 && y >= 9 && y <= 13) return { emoji: '', color: 'bg-purple-950', border: '', isWall: false }
      if (x >= 34 && x <= 49 && y >= 8 && y <= 13) return { emoji: '', color: 'bg-pink-950', border: '', isWall: false }
      if (x >= 54 && x <= 65 && y >= 10 && y <= 13) return { emoji: '', color: 'bg-blue-950', border: '', isWall: false }
      if (x >= 69 && x <= 73 && y >= 9 && y <= 13) return { emoji: '', color: 'bg-cyan-950', border: '', isWall: false }
      return { emoji: '', color: 'bg-purple-900', border: '', isWall: false }
    }
    // ROYAL FLOOR - Level 8 (y: 0-7)
    else {
      if (x >= 2 && x <= 9 && y >= 2 && y <= 6) return { emoji: '', color: 'bg-indigo-900', border: '', isWall: false }
      if (x >= 14 && x <= 25 && y >= 1 && y <= 6) return { emoji: '', color: 'bg-purple-800', border: '', isWall: false }
      if (x >= 30 && x <= 39 && y >= 2 && y <= 6) return { emoji: '', color: 'bg-yellow-900', border: '', isWall: false }
      if (x >= 44 && x <= 53 && y >= 1 && y <= 6) return { emoji: '', color: 'bg-pink-900', border: '', isWall: false }
      if (x >= 58 && x <= 65 && y >= 2 && y <= 6) return { emoji: '', color: 'bg-rose-950', border: '', isWall: false }
      if (x >= 70 && x <= 73 && y >= 1 && y <= 6) return { emoji: '', color: 'bg-red-950', border: '', isWall: false }
      return { emoji: '', color: 'bg-indigo-800', border: '', isWall: false }
    }
  }

  const weaponBonus = player.equipped.weapon?.attack || 0
  const armorBonus = player.equipped.armor?.defense || 0
  const xpNeeded = player.level * 100

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate('subjects')}
        className="text-blue-300 hover:text-white transition-colors mb-4 flex items-center gap-2"
      >
        ← Back to Subjects
      </button>

      <div className="flex gap-3">
        {/* Left Panel - Compact Stats */}
        <div className="w-64 flex-shrink-0 space-y-3">
          {/* Character Card */}
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-3 border-2 border-yellow-400">
            <div className="text-center mb-2">
              <div className="text-4xl mb-1">🧙</div>
              <h2 className="text-lg font-bold text-white">{gameState.player.name}</h2>
              <p className="text-yellow-300 text-xs font-semibold">Lvl {player.level} Wizard</p>
            </div>

            {/* HP Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-xs text-white mb-0.5">
                <span>❤️ HP</span>
                <span>{player.hp}/{player.maxHp}</span>
              </div>
              <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                  style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                />
              </div>
            </div>

            {/* XP Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-white mb-0.5">
                <span>✨ XP</span>
                <span>{player.xp}/{xpNeeded}</span>
              </div>
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
                  style={{ width: `${(player.xp / xpNeeded) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-black/30 rounded-lg p-2">
                <div className="text-xs text-gray-300">⚔️</div>
                <div className="text-base font-bold text-red-400">
                  {player.attack}{weaponBonus > 0 && <span className="text-green-400 text-xs">+{weaponBonus}</span>}
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-2">
                <div className="text-xs text-gray-300">🛡️</div>
                <div className="text-base font-bold text-blue-400">
                  {player.defense}{armorBonus > 0 && <span className="text-green-400 text-xs">+{armorBonus}</span>}
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-2">
                <div className="text-xs text-gray-300">💰</div>
                <div className="text-base font-bold text-yellow-400">{player.gold}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-2">
                <div className="text-xs text-gray-300">⚡</div>
                <div className="text-base font-bold text-cyan-400">{energy}</div>
              </div>
            </div>

            {/* Equipment - Compact */}
            <div className="bg-black/30 rounded-lg p-2 mb-2">
              <div className="text-xs font-bold text-white mb-1">Equipment</div>
              <div className="space-y-0.5 text-xs">
                <div className="text-gray-300 truncate">
                  {player.equipped.weapon ? player.equipped.weapon.type : '⚔️'} {player.equipped.weapon?.name || 'None'}
                </div>
                <div className="text-gray-300 truncate">
                  {player.equipped.armor ? player.equipped.armor.type : '🛡️'} {player.equipped.armor?.name || 'None'}
                </div>
              </div>
            </div>

            {/* Active Quests Display */}
            {activeQuests.length > 0 && (
              <div className="bg-yellow-900/50 rounded-lg p-2 border-2 border-yellow-600">
                <div className="text-xs font-bold text-yellow-200 mb-1">📜 Active Quests</div>
                <div className="space-y-1">
                  {activeQuests.map((quest, idx) => (
                    <div key={idx} className="bg-black/30 rounded p-1">
                      <div className="text-xs text-yellow-100 truncate">{quest.name}</div>
                      <div className="bg-black/40 rounded-full h-1.5 overflow-hidden mt-0.5">
                        <div
                          className="bg-yellow-500 h-full transition-all"
                          style={{ width: `${Math.min(100, (quest.progress / quest.goal) * 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-yellow-300 text-right">{quest.progress}/{quest.goal}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInventory(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 text-sm rounded-lg transition-all"
            >
              🎒 Bag ({player.inventory.length})
            </button>
          </div>

          {/* Controls - Compact */}
          <div className="bg-black/40 backdrop-blur-lg rounded-xl p-2 border-2 border-pink-500/30">
            <h3 className="text-white font-bold mb-1 text-xs">🎮 Controls</h3>
            <div className="space-y-0.5 text-xs text-blue-200">
              <p>• Arrows - Move</p>
              <p>• Q - Question</p>
              <p>• I - Inventory</p>
            </div>
          </div>
        </div>

        {/* Center - Game Board */}
        <div className="flex-1">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-pink-500/30">
            <h1 className="text-3xl font-bold text-white mb-4 text-center">🏰 Castle Explorer RPG</h1>

            <div className="flex justify-center mb-4">
              <div className="bg-stone-900 p-2 rounded-xl border-4 border-stone-700">
                <div className="grid gap-0.5" style={{
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
                }}>
                  {Array.from({ length: GRID_SIZE }, (_, y) =>
                    Array.from({ length: GRID_SIZE }, (_, x) => {
                      const cell = getTileDisplay(x, y)
                      return (
                        <div
                          key={`${x},${y}`}
                          className={`${cell.color} ${cell.border} flex items-center justify-center text-2xl font-bold transition-all`}
                          style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        >
                          {cell.emoji}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-stone-800 rounded p-1.5">
                <span className="text-xl">🧙</span>
                <p className="text-white font-semibold">You</p>
              </div>
              <div className="bg-stone-800 rounded p-1.5">
                <span className="text-xl">👹🧟🐉</span>
                <p className="text-white font-semibold">Enemies</p>
              </div>
              <div className="bg-stone-800 rounded p-1.5">
                <span className="text-xl">⚔️🛡️</span>
                <p className="text-white font-semibold">Items</p>
              </div>
              <div className="bg-stone-800 rounded p-1.5">
                <span className="text-xl">🧙👸</span>
                <p className="text-white font-semibold">NPCs</p>
              </div>
              <div className="bg-stone-800 rounded p-1.5">
                <span className="text-xl">🪑🕯️</span>
                <p className="text-white font-semibold">Furniture</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {showQuestion && currentQuestion && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 max-w-2xl w-full border-4 border-yellow-400">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">📜</div>
              <h2 className="text-3xl font-bold text-white mb-2">Ancient Riddle</h2>
              <p className="text-yellow-300 font-semibold">Answer correctly to gain 20 energy!</p>
            </div>

            <div className="bg-black/30 rounded-2xl p-6 mb-6">
              <p className="text-white text-xl font-semibold mb-6 leading-relaxed">
                {currentQuestion.question}
              </p>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswer(idx)}
                    disabled={feedback !== null}
                    className={`w-full p-4 rounded-xl font-bold text-lg transition-all ${
                      selectedAnswer === idx
                        ? 'bg-blue-500 text-white ring-4 ring-yellow-400'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    } ${
                      feedback && idx === currentQuestion.correct
                        ? 'bg-green-500 text-white'
                        : feedback && idx === selectedAnswer && idx !== currentQuestion.correct
                        ? 'bg-red-500 text-white'
                        : ''
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {feedback ? (
              <div className={`text-center p-4 rounded-xl ${
                feedback.type === 'correct' ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <p className="text-white font-bold text-xl mb-2">
                  {feedback.type === 'correct' ? '✅ Correct! +20 Energy' : '❌ Incorrect'}
                </p>
                <p className="text-white">{feedback.message}</p>
              </div>
            ) : (
              <button
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Submit Answer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Combat Modal */}
      {showCombat && currentEnemy && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-red-900 to-gray-900 rounded-3xl p-8 max-w-3xl w-full border-4 border-red-500 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">⚔️ BATTLE ⚔️</h2>

            {/* Attack Animation Effects */}
            {attackAnimation && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {attackAnimation.type === 'player' && (
                  <>
                    {/* Weapon slash from left to right */}
                    <div
                      className={`absolute text-6xl ${attackAnimation.color} animate-slash-right`}
                      style={{
                        left: '20%',
                        top: '40%',
                        animation: 'slashRight 0.6s ease-out'
                      }}
                    >
                      {attackAnimation.weaponEmoji}
                    </div>
                    {/* Impact flash on enemy */}
                    <div
                      className="absolute inset-0 bg-white opacity-30 animate-flash"
                      style={{ animation: 'flash 0.3s ease-out' }}
                    />
                  </>
                )}
                {attackAnimation.type === 'enemy' && (
                  <>
                    {/* Enemy attack from right to left */}
                    <div
                      className={`absolute text-6xl ${attackAnimation.color} animate-slash-left`}
                      style={{
                        right: '20%',
                        top: '40%',
                        animation: 'slashLeft 0.6s ease-out'
                      }}
                    >
                      {attackAnimation.weaponEmoji}
                    </div>
                    {/* Impact flash on player */}
                    <div
                      className="absolute inset-0 bg-red-600 opacity-20 animate-flash"
                      style={{ animation: 'flash 0.3s ease-out' }}
                    />
                  </>
                )}
              </div>
            )}

            {/* Damage Number Effects */}
            {attackEffect.map(effect => (
              <div
                key={effect.id}
                className="absolute text-4xl font-bold text-yellow-400 animate-damage-float pointer-events-none z-20"
                style={{
                  left: `${effect.x}%`,
                  top: `${effect.y}%`,
                  animation: 'damageFloat 1s ease-out',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}
              >
                -{effect.damage}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-8 mb-6 relative z-5">
              {/* Player */}
              <div className="text-center">
                <div
                  className={`text-6xl mb-2 transition-all duration-200 ${
                    attackAnimation?.type === 'enemy' ? 'animate-shake' : ''
                  }`}
                  style={attackAnimation?.type === 'enemy' ? { animation: 'shake 0.5s ease-in-out' } : {}}
                >
                  🧙
                </div>
                <div className="text-xl font-bold text-white mb-2">{gameState.player.name}</div>
                {player.equipped.weapon && (
                  <div className="text-sm text-blue-300 mb-1">
                    {player.equipped.weapon.type} {player.equipped.weapon.name}
                  </div>
                )}
                <div className="bg-black/50 rounded-lg p-3">
                  <div className="text-sm text-gray-300 mb-1">HP</div>
                  <div className="h-4 bg-gray-900 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                      style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                    />
                  </div>
                  <div className="text-white font-bold">{player.hp}/{player.maxHp}</div>
                </div>
              </div>

              {/* Enemy */}
              <div className="text-center">
                <div
                  className={`text-6xl mb-2 transition-all duration-200 ${
                    attackAnimation?.type === 'player' ? 'animate-shake' : ''
                  }`}
                  style={attackAnimation?.type === 'player' ? { animation: 'shake 0.5s ease-in-out' } : {}}
                >
                  {currentEnemy.type}
                </div>
                <div className="text-xl font-bold text-white mb-2">{currentEnemy.name}</div>
                <div className="bg-black/50 rounded-lg p-3">
                  <div className="text-sm text-gray-300 mb-1">HP</div>
                  <div className="h-4 bg-gray-900 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                      style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }}
                    />
                  </div>
                  <div className="text-white font-bold">{currentEnemy.hp}/{currentEnemy.maxHp}</div>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes slashRight {
                0% {
                  transform: translate(-100px, 0) rotate(-45deg) scale(0.5);
                  opacity: 0;
                }
                50% {
                  transform: translate(200px, -20px) rotate(45deg) scale(1.5);
                  opacity: 1;
                }
                100% {
                  transform: translate(400px, -40px) rotate(90deg) scale(0.8);
                  opacity: 0;
                }
              }

              @keyframes slashLeft {
                0% {
                  transform: translate(100px, 0) rotate(45deg) scale(0.5);
                  opacity: 0;
                }
                50% {
                  transform: translate(-200px, -20px) rotate(-45deg) scale(1.5);
                  opacity: 1;
                }
                100% {
                  transform: translate(-400px, -40px) rotate(-90deg) scale(0.8);
                  opacity: 0;
                }
              }

              @keyframes flash {
                0%, 100% { opacity: 0; }
                50% { opacity: 0.4; }
              }

              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
              }

              @keyframes damageFloat {
                0% {
                  transform: translateY(0) scale(0.5);
                  opacity: 1;
                }
                50% {
                  transform: translateY(-30px) scale(1.2);
                  opacity: 1;
                }
                100% {
                  transform: translateY(-60px) scale(0.8);
                  opacity: 0;
                }
              }
            `}</style>

            {/* Combat Log */}
            <div className="bg-black/50 rounded-xl p-4 mb-6 h-32 overflow-y-auto">
              {combatLog.map((log, idx) => (
                <div key={idx} className="text-white mb-1">&gt; {log}</div>
              ))}
            </div>

            {/* Actions */}
            {currentEnemy.hp > 0 && player.hp > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={playerAttack}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                >
                  ⚔️ Attack
                </button>
                <button
                  onClick={() => setShowInventory(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                >
                  🎒 Use Item
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl p-8 max-w-2xl w-full border-4 border-purple-500">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">🎒 Inventory</h2>

            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto mb-6">
              {player.inventory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Your inventory is empty</p>
              ) : (
                player.inventory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => useItem(item)}
                    className="bg-black/30 hover:bg-black/50 rounded-xl p-4 text-left transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.type}</span>
                      <div>
                        <div className="text-white font-bold">{item.name}</div>
                        <div className="text-sm text-gray-300">
                          {item.itemType === 'weapon' && `+${item.attack} Attack`}
                          {item.itemType === 'armor' && `+${item.defense} Defense`}
                          {item.itemType === 'consumable' && `Heals ${item.healing} HP`}
                        </div>
                      </div>
                    </div>
                    <div className="text-yellow-400 font-bold">{item.value}G</div>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={() => setShowInventory(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* NPC Dialog */}
      {showNPC && currentNPC && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-3xl p-8 max-w-2xl w-full border-4 border-blue-500 my-8">
            {/* NPC Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{currentNPC.type}</div>
              <h2 className="text-2xl font-bold text-white mb-2">{currentNPC.name}</h2>
              {npcReputation[currentNPC.name] !== undefined && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-yellow-400">Reputation:</span>
                  <div className="bg-black/40 rounded-full px-3 py-1">
                    <span className={`font-bold ${
                      npcReputation[currentNPC.name] >= 100 ? 'text-purple-400' :
                      npcReputation[currentNPC.name] >= 50 ? 'text-green-400' :
                      npcReputation[currentNPC.name] >= 0 ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      {npcReputation[currentNPC.name] >= 100 ? 'Honored' :
                       npcReputation[currentNPC.name] >= 50 ? 'Friendly' :
                       npcReputation[currentNPC.name] >= 0 ? 'Neutral' : 'Unfriendly'}
                    </span>
                    <span className="text-gray-400 ml-2">({npcReputation[currentNPC.name]})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dialogue */}
            <div className="bg-black/30 rounded-xl p-6 mb-6">
              <p className="text-white text-lg leading-relaxed">
                {Array.isArray(currentNPC.dialogue)
                  ? currentNPC.dialogue[Math.min(npcDialogueStage, currentNPC.dialogue.length - 1)]
                  : currentNPC.dialogue}
              </p>
            </div>

            {/* Services Available */}
            {currentNPC.services && currentNPC.services.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="text-white font-bold text-center mb-3">Services Available:</h3>

                {/* Quest Service */}
                {currentNPC.services.includes('quest') && currentNPC.quest && (
                  <div>
                    {!activeQuests.find(q => q.id === currentNPC.quest.id) && !completedQuests.includes(currentNPC.quest.id) ? (
                      <button
                        onClick={() => {
                          setActiveQuests(prev => [...prev, { ...currentNPC.quest, progress: 0, from: currentNPC.name }])
                          setNpcReputation(prev => ({ ...prev, [currentNPC.name]: (prev[currentNPC.name] || 0) + 10 }))
                          setNpcDialogueStage(1)
                        }}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl transition-all"
                      >
                        📜 Accept Quest: {currentNPC.quest.name}
                      </button>
                    ) : activeQuests.find(q => q.id === currentNPC.quest.id) ? (
                      <div className="bg-yellow-900/50 rounded-xl p-4 border-2 border-yellow-500">
                        <p className="text-yellow-200 font-bold mb-2">{currentNPC.quest.name} (Active)</p>
                        <p className="text-yellow-100 text-sm mb-2">{currentNPC.quest.description}</p>
                        <div className="bg-black/40 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-yellow-500 h-full transition-all"
                            style={{ width: `${Math.min(100, (activeQuests.find(q => q.id === currentNPC.quest.id)?.progress || 0) / currentNPC.quest.goal * 100)}%` }}
                          />
                        </div>
                        <p className="text-yellow-300 text-xs mt-1 text-center">
                          {activeQuests.find(q => q.id === currentNPC.quest.id)?.progress || 0} / {currentNPC.quest.goal}
                        </p>
                        {activeQuests.find(q => q.id === currentNPC.quest.id)?.progress >= currentNPC.quest.goal && (
                          <button
                            onClick={() => {
                              const quest = currentNPC.quest
                              setPlayer(prev => ({
                                ...prev,
                                gold: prev.gold + quest.reward.gold,
                                xp: prev.xp + quest.reward.xp
                              }))
                              setActiveQuests(prev => prev.filter(q => q.id !== quest.id))
                              setCompletedQuests(prev => [...prev, quest.id])
                              setNpcReputation(prev => ({ ...prev, [currentNPC.name]: (prev[currentNPC.name] || 0) + 50 }))
                              setNpcDialogueStage(2)
                            }}
                            className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-all"
                          >
                            ✅ Complete Quest (+{currentNPC.quest.reward.gold} gold, +{currentNPC.quest.reward.xp} XP)
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-green-900/50 rounded-xl p-3 border-2 border-green-500 text-center">
                        <p className="text-green-200 font-bold">✅ {currentNPC.quest.name} (Completed)</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Heal Service */}
                {currentNPC.services.includes('heal') && (
                  <button
                    onClick={() => {
                      const healCost = 30
                      if (player.gold >= healCost && player.hp < player.maxHp) {
                        setPlayer(prev => ({
                          ...prev,
                          hp: prev.maxHp,
                          gold: prev.gold - healCost
                        }))
                        setNpcReputation(prev => ({ ...prev, [currentNPC.name]: (prev[currentNPC.name] || 0) + 5 }))
                      }
                    }}
                    disabled={player.gold < 30 || player.hp >= player.maxHp}
                    className={`w-full font-bold py-3 rounded-xl transition-all ${
                      player.gold >= 30 && player.hp < player.maxHp
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    💚 Full Heal (30 gold)
                  </button>
                )}

                {/* Shop Service */}
                {currentNPC.services.includes('shop') && currentNPC.shop && (
                  <div className="space-y-2">
                    <p className="text-yellow-300 font-bold text-center">Shop:</p>
                    {currentNPC.shop.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (player.gold >= item.cost) {
                            let newPlayer = { ...player, gold: player.gold - item.cost }
                            if (item.effect === 'heal') newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + item.value)
                            else if (item.effect === 'maxHp') newPlayer.maxHp += item.value
                            else if (item.effect === 'attack') newPlayer.attack += item.value
                            else if (item.effect === 'defense') newPlayer.defense += item.value
                            else if (item.effect === 'energy') setEnergy(prev => prev + item.value)
                            setPlayer(newPlayer)
                            setNpcReputation(prev => ({ ...prev, [currentNPC.name]: (prev[currentNPC.name] || 0) + 3 }))
                          }
                        }}
                        disabled={player.gold < item.cost}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          player.gold >= item.cost
                            ? 'bg-blue-700 hover:bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{item.name}</span>
                          <span className="text-yellow-400">{item.cost} 💰</span>
                        </div>
                        <p className="text-xs opacity-80">{item.description}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Upgrade Service */}
                {currentNPC.services.includes('upgrade') && currentNPC.upgrades && (
                  <div className="space-y-2">
                    <p className="text-purple-300 font-bold text-center">Upgrades:</p>
                    {currentNPC.upgrades.map((upgrade, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (player.gold >= upgrade.cost) {
                            let newPlayer = { ...player, gold: player.gold - upgrade.cost }
                            if (upgrade.effect === 'attack') newPlayer.attack += upgrade.value
                            else if (upgrade.effect === 'defense') newPlayer.defense += upgrade.value
                            else if (upgrade.effect === 'both') {
                              newPlayer.attack += upgrade.atkValue
                              newPlayer.defense += upgrade.defValue
                            }
                            setPlayer(newPlayer)
                            setNpcReputation(prev => ({ ...prev, [currentNPC.name]: (prev[currentNPC.name] || 0) + 8 }))
                          }
                        }}
                        disabled={player.gold < upgrade.cost}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          player.gold >= upgrade.cost
                            ? 'bg-purple-700 hover:bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{upgrade.name}</span>
                          <span className="text-yellow-400">{upgrade.cost} 💰</span>
                        </div>
                        <p className="text-xs opacity-80">{upgrade.description}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Blessings Service */}
                {currentNPC.services.includes('bless') && currentNPC.blessings && (
                  <div className="space-y-2">
                    <p className="text-yellow-300 font-bold text-center">Blessings:</p>
                    {currentNPC.blessings.map((blessing, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (player.gold >= blessing.cost) {
                            let newPlayer = { ...player, gold: player.gold - blessing.cost }
                            if (blessing.effect === 'heal') newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + blessing.value)
                            else if (blessing.effect === 'fullHeal') newPlayer.hp = newPlayer.maxHp
                            setPlayer(newPlayer)
                            setNpcReputation(prev => ({ ...prev, [currentNPC.name]: (prev[currentNPC.name] || 0) + 10 }))
                          }
                        }}
                        disabled={player.gold < blessing.cost}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          player.gold >= blessing.cost
                            ? 'bg-yellow-700 hover:bg-yellow-600 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{blessing.name}</span>
                          <span className="text-yellow-400">{blessing.cost} 💰</span>
                        </div>
                        <p className="text-xs opacity-80">{blessing.description}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Info/Lore Service */}
                {currentNPC.services.includes('info') && (
                  <div className="bg-blue-900/50 rounded-xl p-4 border-2 border-blue-500">
                    <p className="text-blue-200 text-sm leading-relaxed">
                      💡 <strong>Tip:</strong> The deeper you go, the stronger the enemies. Make sure you're well equipped before descending to the basement levels!
                    </p>
                  </div>
                )}
                {currentNPC.services.includes('lore') && (
                  <div className="bg-purple-900/50 rounded-xl p-4 border-2 border-purple-500">
                    <p className="text-purple-200 text-sm leading-relaxed">
                      📖 <strong>Lore:</strong> This castle was once a beacon of knowledge. Now darkness has corrupted its halls. Only by answering questions can you restore the light!
                    </p>
                  </div>
                )}

                {/* Secret History Button */}
                {currentNPC.services.includes('secret') && !secretRoomRevealed && (
                  <button
                    onClick={() => {
                      setSecretRoomRevealed(true)
                      setNpcDialogueStage(2)
                      setNpcReputation(prev => ({ ...prev, [currentNPC.name]: (prev[currentNPC.name] || 0) + 100 }))
                    }}
                    className="w-full bg-gradient-to-r from-yellow-600 to-amber-700 hover:from-yellow-700 hover:to-amber-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                  >
                    🗝️ Learn Castle History (Reveal Ancient Secret)
                  </button>
                )}

                {secretRoomRevealed && currentNPC.services.includes('secret') && (
                  <div className="bg-yellow-900/50 rounded-xl p-4 border-2 border-yellow-500">
                    <p className="text-yellow-200 text-sm leading-relaxed font-bold">
                      ✨ <strong>Ancient Secret Revealed!</strong> A hidden chamber has appeared in the Great Hall! Seek the legendary BLADE OF ETERNITY behind where knowledge is kept... (x: 30, y: 20)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                setShowNPC(false)
                setCurrentNPC(null)
                setNpcDialogueStage(0)
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              Leave
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
