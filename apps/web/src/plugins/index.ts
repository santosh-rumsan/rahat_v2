import { BeneficiaryFrontendPlugin } from '@rahataid/plugin-project-beneficiary/frontend'
import { CvaFrontendPlugin } from '@rahataid/plugin-project-cva/frontend'
import { AaFrontendPlugin } from '@rahataid/plugin-project-aa/frontend'
import { MicrolearningFrontendPlugin } from '@rahataid/plugin-project-microlearning/frontend'
import { MicroloansFrontendPlugin } from '@rahataid/plugin-project-microloans/frontend'
import { DashboardFrontendPlugin } from '@rahataid/plugin-core-dashboard/frontend'
import { VendorsFrontendPlugin } from '@rahataid/plugin-core-vendors/frontend'
import { FundManagementFrontendPlugin } from '@rahataid/plugin-core-fund-management/frontend'
import { ForecastFrontendPlugin } from '@rahataid/plugin-core-forecast/frontend'
import { ReportsFrontendPlugin } from '@rahataid/plugin-core-reports/frontend'
import { registerPlugin } from './registry'
import { registerAppPlugin } from './app-registry'

// Register all installed project plugins
registerPlugin(CvaFrontendPlugin)
registerPlugin(BeneficiaryFrontendPlugin)
registerPlugin(AaFrontendPlugin)
registerPlugin(MicrolearningFrontendPlugin)
registerPlugin(MicroloansFrontendPlugin)

// Register app plugins
registerAppPlugin(DashboardFrontendPlugin)
registerAppPlugin(VendorsFrontendPlugin)
registerAppPlugin(FundManagementFrontendPlugin)
registerAppPlugin(ForecastFrontendPlugin)
registerAppPlugin(ReportsFrontendPlugin)

// Register task plugins — each import self-registers via registerTaskType()
import '@rahataid/plugin-task-sms'
import '@rahataid/plugin-task-voice'
import '@rahataid/plugin-task-benefits'

// Register communication plugins — each import self-registers via registerCommType()
import '@rahataid/plugin-comms-sms'
import '@rahataid/plugin-comms-whatsapp'
import '@rahataid/plugin-comms-voice'

export { getRegisteredPlugins, getPlugin } from './registry'
export { getRegisteredAppPlugins, getAppPlugin } from './app-registry'
