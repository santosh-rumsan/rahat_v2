import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TriggerStatementOverview, useTriggersByProject, useProject } from '@rahataid/projects-shared'
import { getPlugin } from '@/plugins'
import type { TriggerManagementConfig } from '@rahataid/projects-shared'

export const Route = createFileRoute('/_app/projects/$id/triggers/')({
  component: TriggersOverviewPage,
})

function TriggersOverviewPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id)
  const { data: allTriggers = [] } = useTriggersByProject(id)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Project not found.
      </div>
    )
  }

  const plugin = getPlugin(project.projectType)
  const phases =
    plugin?.triggerPhases ??
    plugin?.taskGroups?.filter((g) => g !== 'General') ??
    ['ACTIVATION', 'READINESS']

  const config: TriggerManagementConfig = {
    projectId: id,
    phases,
    onViewDetails: (_phase, statementId) =>
      navigate({ to: '/projects/$id/triggers/$statementId', params: { id, statementId } }),
    onAddTrigger: (_phase, statementId) =>
      navigate({ to: '/projects/$id/triggers/$statementId/add', params: { id, statementId } }),
  }

  return (
    <div className="p-6">
      <TriggerStatementOverview config={config} triggers={allTriggers} />
    </div>
  )
}
