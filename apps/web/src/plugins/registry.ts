import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'

const plugins: ProjectFrontendPlugin[] = []

export function registerPlugin(plugin: ProjectFrontendPlugin): void {
  plugins.push(plugin)
}

export function getRegisteredPlugins(): ProjectFrontendPlugin[] {
  return plugins
}

export function getPlugin(projectType: string): ProjectFrontendPlugin | undefined {
  return plugins.find((p) => p.projectType === projectType)
}
