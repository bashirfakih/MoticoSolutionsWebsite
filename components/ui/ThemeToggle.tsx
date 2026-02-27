'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon - shown in dark mode */}
      <Sun
        className={`w-5 h-5 absolute transition-all duration-300 ${
          resolvedTheme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-0'
        }`}
        style={{ color: '#fbbf24' }}
      />
      {/* Moon icon - shown in light mode */}
      <Moon
        className={`w-5 h-5 absolute transition-all duration-300 ${
          resolvedTheme === 'light'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-0'
        }`}
        style={{ color: '#004D8B' }}
      />
    </button>
  )
}
