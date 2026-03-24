import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TriggerStatementDetail, useProject } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/$id/triggers/$statementId/')({
  component: TriggerStatementDetailPage,
})

function TriggerStatementDetailPage() {
  const { id, statementId } = Route.useParams()
  const navigate = useNavigate()
  const { data: project } = useProject(id)

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="p-6">
      <TriggerStatementDetail
        statementId={statementId}
        projectId={id}
        onBack={() => navigate({ to: '/projects/$id/triggers', params: { id } })}
        onAddTrigger={() =>
          navigate({ to: '/projects/$id/triggers/$statementId/add', params: { id, statementId } })
        }
        onManageThreshold={() =>
          navigate({ to: '/projects/$id/triggers/$statementId/configure', params: { id, statementId } })
        }
      />
    </div>
  )
}
