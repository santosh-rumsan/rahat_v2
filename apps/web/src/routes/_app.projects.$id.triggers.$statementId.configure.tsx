import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TriggerConfigure, useTriggerStatement } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/$id/triggers/$statementId/configure')({
  component: TriggerConfigurePage,
})

function TriggerConfigurePage() {
  const { id, statementId } = Route.useParams()
  const navigate = useNavigate()
  const { data: statement } = useTriggerStatement(statementId)

  if (!statement) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    )
  }

  function goBack() {
    navigate({ to: '/projects/$id/triggers/$statementId', params: { id, statementId } })
  }

  return (
    <div className="p-6">
      <TriggerConfigure
        statement={statement}
        projectId={id}
        onSuccess={goBack}
        onCancel={goBack}
      />
    </div>
  )
}
