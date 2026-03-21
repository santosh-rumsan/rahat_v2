import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { FundManagementPage } from './fund-management-page.js'

export const FundManagementFrontendPlugin: AppFrontendPlugin = {
  id: 'fund-management',
  label: 'Fund Management',
  route: '/fund-management',
  PageComponent: FundManagementPage,
}
