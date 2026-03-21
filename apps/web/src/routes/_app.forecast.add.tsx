import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ForecastSourceForm } from '@rahataid/plugin-forecast/frontend'

export const Route = createFileRoute('/_app/forecast/add')({ component: ForecastAddPage })

function ForecastAddPage() {
  const navigate = useNavigate()
  return (
    <ForecastSourceForm
      onSave={() => navigate({ to: '/forecast' })}
      onCancel={() => navigate({ to: '/forecast' })}
    />
  )
}
