import { BeneficiaryFrontendPlugin } from '@rahataid/plugin-project-beneficiary/frontend'
import { CvaFrontendPlugin } from '@rahataid/plugin-project-cva/frontend'
import { AaFrontendPlugin } from '@rahataid/plugin-project-aa/frontend'
import { MicrolearningFrontendPlugin } from '@rahataid/plugin-project-microlearning/frontend'
import { MicroloansFrontendPlugin } from '@rahataid/plugin-project-microloans/frontend'
import { registerPlugin } from './registry'

// Register all installed project plugins
registerPlugin(CvaFrontendPlugin)
registerPlugin(BeneficiaryFrontendPlugin)
registerPlugin(AaFrontendPlugin)
registerPlugin(MicrolearningFrontendPlugin)
registerPlugin(MicroloansFrontendPlugin)

export { getRegisteredPlugins, getPlugin } from './registry'
