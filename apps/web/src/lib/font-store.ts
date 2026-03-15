const FONT_KEY = 'rahat-font'

export type AppFont = 'outfit' | 'inter' | 'plus-jakarta-sans' | 'josefin-sans' | 'lora'

export interface FontOption {
  id: AppFont
  label: string
  family: string
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'outfit',            label: 'Outfit',            family: 'Outfit Variable' },
  { id: 'inter',             label: 'Inter',             family: 'Inter Variable' },
  { id: 'plus-jakarta-sans', label: 'Plus Jakarta Sans', family: 'Plus Jakarta Sans Variable' },
  { id: 'josefin-sans',      label: 'Josefin Sans',      family: 'Josefin Sans Variable' },
  { id: 'lora',              label: 'Lora',              family: 'Lora Variable' },
]

export function loadFont(): AppFont {
  try {
    const stored = localStorage.getItem(FONT_KEY) as AppFont | null
    if (stored && FONT_OPTIONS.some((f) => f.id === stored)) return stored
  } catch {}
  return 'outfit'
}

export function applyFont(font: AppFont): void {
  if (font === 'outfit') {
    document.documentElement.removeAttribute('data-font')
  } else {
    document.documentElement.setAttribute('data-font', font)
  }
}

export function saveFont(font: AppFont): void {
  try {
    localStorage.setItem(FONT_KEY, font)
  } catch {}
  applyFont(font)
}

/** Inline script — apply before first paint to avoid flash */
export const fontScript = `(function(){var f=localStorage.getItem('${FONT_KEY}');if(f&&f!=='outfit')document.documentElement.setAttribute('data-font',f);})()`
