const STORAGE_KEY = 'rahat:plugin-states'

function getAll(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function isPluginEnabled(id: string): boolean {
  const all = getAll()
  return id in all ? all[id] : true
}

export function setPluginEnabled(id: string, enabled: boolean): void {
  const all = getAll()
  all[id] = enabled
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}
