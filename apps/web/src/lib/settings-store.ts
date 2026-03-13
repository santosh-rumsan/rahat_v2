const SETTINGS_KEY = 'rahat-app-settings'

export const ALL_BLOCKCHAINS = ['Ethereum', 'Polygon', 'Base', 'Private Chain'] as const

export interface AppSettings {
  /** null means all project types are enabled */
  enabledProjectTypes: string[] | null
  enabledBlockchains: string[]
}

function defaults(): AppSettings {
  return {
    enabledProjectTypes: null,
    enabledBlockchains: [...ALL_BLOCKCHAINS],
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaults()
    return { ...defaults(), ...JSON.parse(raw) }
  } catch {
    return defaults()
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function isProjectTypeEnabled(projectType: string): boolean {
  const { enabledProjectTypes } = loadSettings()
  if (enabledProjectTypes === null) return true
  return enabledProjectTypes.includes(projectType)
}
