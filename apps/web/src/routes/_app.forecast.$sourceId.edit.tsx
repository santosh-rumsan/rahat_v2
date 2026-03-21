import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ForecastSourceForm, useForecastSource } from '@rahataid/plugin-core-forecast/frontend'

export const Route = createFileRoute('/_app/forecast/$sourceId/edit')({
  component: ForecastEditPage,
})

function ForecastEditPage() {
  const { sourceId } = Route.useParams()
  const navigate = useNavigate()
  const { data: source, isLoading } = useForecastSource(sourceId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    )
  }

  if (!source) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Source not found.
      </div>
    )
  }

  return (
    <ForecastSourceForm
      source={source}
      onSave={() => navigate({ to: '/forecast' })}
      onCancel={() => navigate({ to: '/forecast' })}
    />
  )
}
