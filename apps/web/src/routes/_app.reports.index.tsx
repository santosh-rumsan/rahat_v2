import { createFileRoute } from '@tanstack/react-router'
import { ReportsPage } from '@rahataid/plugin-reports/frontend'

export const Route = createFileRoute('/_app/reports/')({ component: ReportsPage })
