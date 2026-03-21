import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { VendorsPage } from './vendors-page.js'

export const VendorsFrontendPlugin: AppFrontendPlugin = {
  id: 'vendors',
  label: 'Vendors',
  description: 'Manage vendors and their information for aid distribution.',
  icon: 'Building2',
  group: 'core',
  route: '/vendors',
  PageComponent: VendorsPage,
}
