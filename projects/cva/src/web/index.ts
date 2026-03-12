import type { ProjectFrontendPlugin } from '@rahataid/plugin-sdk'
import { PROJECT_TYPES } from '@rahataid/plugin-sdk'
import { CvaSetupPage } from './setup-page.js'

export const CvaWebPlugin: ProjectFrontendPlugin = {
  projectType: PROJECT_TYPES.CVA,
  label: 'Cash Voucher Assistance',
  description: 'Distribute cash vouchers to beneficiaries',
  icon: 'Wallet',
  SetupPage: CvaSetupPage,
}
