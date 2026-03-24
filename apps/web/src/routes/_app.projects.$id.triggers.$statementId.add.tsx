import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TriggerAdd, useTriggerStatement, useProject } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/$id/triggers/$statementId/add')({
  component: TriggerAddPage,
})

function TriggerAddPage() {
  const { id, statementId } = Route.useParams()
  const navigate = useNavigate()
  const { data: project } = useProject(id)
  const { data: statement } = useTriggerStatement(statementId)

  if (!project || !statement) {
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
      <TriggerAdd
        statement={statement}
        config={{ projectId: id, phases: [statement.phase] }}
        onSuccess={goBack}
        onCancel={goBack}
      />
    </div>
  )
}
