import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { ChevronLeft } from 'lucide-react'
import { TaskForm } from './components/task-form.js'

export function TaskManagementAddTaskPage({ project }: { project: ProjectSummary }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <a href={`/projects/${project.id}/tasks`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ChevronLeft size={14} />
          Back to tasks
        </a>
        <h1 className="text-2xl font-black text-[#1a1a1a]">Add Task</h1>
        <p className="text-sm text-gray-400 mt-1">Fill in the details below to create a new task.</p>
      </div>
      <div className="flex-1 px-8 py-6 max-w-2xl">
        <TaskForm project={project} onSubmit={() => { window.location.href = `/projects/${project.id}/tasks` }} />
      </div>
    </div>
  )
}
