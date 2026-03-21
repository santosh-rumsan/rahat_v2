import type { AppFrontendPlugin } from '@rahataid/plugin-sdk'
import { ForecastPage } from './forecast-page.js'

export const ForecastFrontendPlugin: AppFrontendPlugin = {
  id: 'forecast',
  label: 'Forecast',
  description: 'Anticipatory action triggers based on weather and climate data.',
  icon: 'CloudSun',
  group: 'core',
  route: '/forecast',
  PageComponent: ForecastPage,
}

export { ForecastPage } from './forecast-page.js'
export { ForecastSourceForm } from './forecast-source-form.js'
export type { ForecastSourceFormProps } from './forecast-source-form.js'
export { GlofasCard, ReturnPeriodTable, HydrographImage } from './glofas-card.js'
export type { GlofasItem, GlofasInfo, GlofasReturnPeriodTable } from './glofas-card.js'
export {
  forecastKeys,
  useForecastSources,
  useForecastSource,
  useForecastSourceData,
  useCreateForecastSource,
  useUpdateForecastSource,
  useDeleteForecastSource,
  useImportForecastSources,
} from './queries.js'
