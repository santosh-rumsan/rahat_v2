import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { ChevronLeft } from 'lucide-react'
import { type TaskDraft, type ProjectTask } from './types.js'
import { useProjectTasks } from './hooks.js'
import { TaskForm } from './components/task-form.js'

export function TaskManagementEditTaskPage({ project, taskId }: { project: ProjectSummary; taskId: string }) {
  const { tasks, setTasks } = useProjectTasks(project)
  const task = tasks.find((t) => t.id === taskId) ?? null

  if (!task) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Task not found.
      </div>
    )
  }

  const initialDraft: TaskDraft = {
    title: task.title,
    assignedTo: task.assignedTo,
    category: task.category,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status,
    priority: task.priority,
    taskType: task.taskType ?? 'default',
    triggerType: task.triggerType ?? 'manual',
  }

  function handleSave(draft: TaskDraft) {
    const updated: ProjectTask = {
      id: task!.id,
      title: draft.title.trim(),
      assignedTo: draft.assignedTo.trim(),
      category: draft.category,
      description: draft.description.trim(),
      dueDate: draft.dueDate,
      status: draft.status,
      priority: draft.priority,
      taskType: draft.taskType,
      triggerType: draft.triggerType,
      designerData: task!.designerData,
    }
    setTasks((current) => current.map((t) => (t.id === taskId ? updated : t)))
    window.location.href = `/projects/${project.id}/tasks/${taskId}`
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <a href={`/projects/${project.id}/tasks/${taskId}`} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ChevronLeft size={14} />
          Back to task
        </a>
        <h1 className="text-2xl font-black text-[#1a1a1a]">Edit Task</h1>
        <p className="text-sm text-gray-400 mt-1">Update the task details below.</p>
      </div>
      <div className="flex-1 px-8 py-6 max-w-2xl">
        <TaskForm
          project={project}
          initialDraft={initialDraft}
          onSave={handleSave}
          submitLabel="Save changes"
          hideStatus
        />
      </div>
    </div>
  )
}
