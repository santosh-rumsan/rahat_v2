import type { ProjectBackendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { CvaModule } from './cva.module.js'

export { CvaModule }

export const CvaApiPlugin: ProjectBackendPlugin = {
  projectType: PROJECT_TYPES.CVA,
  module: CvaModule,
}
