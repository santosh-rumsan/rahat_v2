import { BeneficiaryWebPlugin } from '@rahataid/project-beneficiary/web'
import { CvaWebPlugin } from '@rahataid/project-cva/web'
import { registerPlugin } from './registry'

// Register all installed project plugins
registerPlugin(CvaWebPlugin)
registerPlugin(BeneficiaryWebPlugin)

export { getRegisteredPlugins, getPlugin } from './registry'
