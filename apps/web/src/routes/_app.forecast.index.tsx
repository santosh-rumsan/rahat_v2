import { createFileRoute } from '@tanstack/react-router'
import { ForecastPage } from '@rahataid/plugin-core-forecast/frontend'

export const Route = createFileRoute('/_app/forecast/')({ component: ForecastPage })
