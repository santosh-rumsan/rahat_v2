import type { ProjectBackendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { MicroloansModule } from './microloans.module.js'

export { MicroloansModule }

export const MicroloansBackendPlugin: ProjectBackendPlugin = {
  projectType: PROJECT_TYPES.MICROLOANS,
  module: MicroloansModule,
}
