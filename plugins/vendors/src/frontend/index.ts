import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { VendorsPage } from './vendors-page.js'

export const VendorsFrontendPlugin: AppFrontendPlugin = {
  id: 'vendors',
  label: 'Vendors',
  route: '/vendors',
  PageComponent: VendorsPage,
}
