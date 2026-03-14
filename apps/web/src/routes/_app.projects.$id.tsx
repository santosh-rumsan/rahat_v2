import { Outlet, createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import projectsData from '../data/projects.json'
import { getPlugin } from '../plugins'
import { ProjectHeader } from '../components/layout/project-header'

export const Route = createFileRoute('/_app/projects/$id')({ component: ProjectLayout })

function ProjectLayout() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const onBack = () => navigate({ to: '/projects' })

  const project = projectsData.find((p) => p.id === id)

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <p className="text-lg font-medium">Project not found</p>
        <button onClick={onBack} className="mt-4 text-sm text-orange-500 hover:underline">
          Back to projects
        </button>
      </div>
    )
  }

  const plugin = getPlugin(project.projectType)
  const isDashboardRoute = location.pathname === `/projects/${id}` || location.pathname === `/projects/${id}/`

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ProjectHeader
        projectId={id}
        projectName={isDashboardRoute ? undefined : project.name}
        projectType={project.projectType}
        menuItems={plugin?.menuItems}
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
