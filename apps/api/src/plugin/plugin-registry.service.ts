import { Injectable, Inject } from '@nestjs/common'
import type { ProjectBackendPlugin } from '@rahataid/plugin-sdk'

export const REGISTERED_PLUGINS = 'REGISTERED_PLUGINS'

@Injectable()
export class PluginRegistryService {
  constructor(
    @Inject(REGISTERED_PLUGINS) private readonly plugins: ProjectBackendPlugin[],
  ) {}

  getAll(): ProjectBackendPlugin[] {
    return this.plugins
  }

  getProjectTypes(): string[] {
    return this.plugins.map((p) => p.projectType)
  }
}
