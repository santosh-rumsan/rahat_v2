const THEME_KEY = 'rahat-color-theme'

export type ColorTheme = 'orange' | 'violet' | 'sky' | 'rose' | 'emerald' | 'fuchsia'

export interface ColorThemeOption {
  id: ColorTheme
  label: string
  /** Hex approximation used for UI swatch */
  swatch: string
}

export const COLOR_THEMES: ColorThemeOption[] = [
  { id: 'orange',  label: 'Orange',  swatch: '#f97316' },
  { id: 'violet',  label: 'Violet',  swatch: '#8b5cf6' },
  { id: 'sky',     label: 'Sky',     swatch: '#0ea5e9' },
  { id: 'rose',    label: 'Rose',    swatch: '#f43f5e' },
  { id: 'emerald', label: 'Emerald', swatch: '#10b981' },
  { id: 'fuchsia', label: 'Fuchsia', swatch: '#d946ef' },
]

export function loadColorTheme(): ColorTheme {
  try {
    const stored = localStorage.getItem(THEME_KEY) as ColorTheme | null
    if (stored && COLOR_THEMES.some((t) => t.id === stored)) return stored
  } catch {}
  return 'orange'
}

export function applyColorTheme(theme: ColorTheme): void {
  if (theme === 'orange') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export function saveColorTheme(theme: ColorTheme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {}
  applyColorTheme(theme)
}

/** Inline script content — apply before first paint to avoid flash */
export const colorThemeScript = `(function(){var t=localStorage.getItem('${THEME_KEY}');if(t&&t!=='orange')document.documentElement.setAttribute('data-theme',t);})()`
