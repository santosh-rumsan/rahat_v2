import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { FundManagementPage } from './fund-management-page.js'

export const FundManagementFrontendPlugin: AppFrontendPlugin = {
  id: 'fund-management',
  label: 'Fund Management',
  description: 'Track and allocate funds across projects and beneficiaries.',
  icon: 'Wallet',
  group: 'core',
  route: '/funds',
  PageComponent: FundManagementPage,
}
