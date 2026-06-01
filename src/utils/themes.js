// Theme configurations for NOVA Quest

export const THEMES = {
  space: {
    name: 'Space',
    primary: 'from-blue-900 via-purple-900 to-indigo-900',
    secondary: 'from-blue-600 to-purple-600',
    accent: 'bg-blue-500',
    text: 'text-blue-200',
    card: 'bg-space-navy',
    button: 'from-blue-500 to-cyan-500',
    border: 'border-blue-400',
  },
  ocean: {
    name: 'Ocean',
    primary: 'from-cyan-900 via-blue-900 to-teal-900',
    secondary: 'from-cyan-600 to-blue-600',
    accent: 'bg-cyan-500',
    text: 'text-cyan-200',
    card: 'bg-cyan-950',
    button: 'from-cyan-500 to-teal-500',
    border: 'border-cyan-400',
  },
  forest: {
    name: 'Forest',
    primary: 'from-green-900 via-emerald-900 to-teal-900',
    secondary: 'from-green-600 to-emerald-600',
    accent: 'bg-emerald-500',
    text: 'text-green-200',
    card: 'bg-green-950',
    button: 'from-green-500 to-emerald-500',
    border: 'border-green-400',
  },
  fire: {
    name: 'Fire',
    primary: 'from-red-900 via-orange-900 to-yellow-900',
    secondary: 'from-red-600 to-orange-600',
    accent: 'bg-orange-500',
    text: 'text-orange-200',
    card: 'bg-red-950',
    button: 'from-red-500 to-orange-500',
    border: 'border-orange-400',
  },
  neon: {
    name: 'Neon',
    primary: 'from-pink-900 via-purple-900 to-blue-900',
    secondary: 'from-pink-600 to-purple-600',
    accent: 'bg-pink-500',
    text: 'text-pink-200',
    card: 'bg-purple-950',
    button: 'from-pink-500 to-purple-500',
    border: 'border-pink-400',
  },
}

export function getTheme(themeName) {
  return THEMES[themeName] || THEMES.space
}

export function applyTheme(themeName) {
  const theme = getTheme(themeName)
  return {
    background: `bg-gradient-to-br ${theme.primary}`,
    card: theme.card,
    button: `bg-gradient-to-r ${theme.button}`,
    text: theme.text,
    accent: theme.accent,
    border: theme.border,
  }
}
