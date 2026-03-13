import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'

const appPlugins: AppFrontendPlugin[] = []

export function registerAppPlugin(plugin: AppFrontendPlugin): void {
  appPlugins.push(plugin)
}

export function getRegisteredAppPlugins(): AppFrontendPlugin[] {
  return appPlugins
}

export function getAppPlugin(id: string): AppFrontendPlugin | undefined {
  return appPlugins.find((p) => p.id === id)
}
