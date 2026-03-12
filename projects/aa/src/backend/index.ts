import type { ProjectBackendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { AaModule } from './aa.module.js'

export { AaModule }

export const AaBackendPlugin: ProjectBackendPlugin = {
  projectType: PROJECT_TYPES.ANTICIPATORY_ACTION,
  module: AaModule,
}
