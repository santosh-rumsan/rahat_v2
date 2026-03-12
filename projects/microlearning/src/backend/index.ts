import type { ProjectBackendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { MicrolearningModule } from './microlearning.module.js'

export { MicrolearningModule }

export const MicrolearningBackendPlugin: ProjectBackendPlugin = {
  projectType: PROJECT_TYPES.MICROLEARNING,
  module: MicrolearningModule,
}
