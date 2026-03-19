import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { Button } from '@rs/ui/button'
import { Input } from '@rs/ui/input'
import { Textarea } from '@rs/ui/textarea'
import { type TaskDraft, type TaskStatus, type TaskPriority, CATEGORIES, TASK_STATUSES, PRIORITIES, getDefaultTaskDraft } from '../types.js'
import { type ProjectTask } from '../types.js'
import { useProjectTasks } from '../hooks.js'
import { FormSelect } from './form-select.js'

export function TaskForm({
  project,
  onSubmit,
  initialDraft,
  onSave,
  submitLabel = 'Add task',
  hideStatus = false,
}: {
  project: ProjectSummary
  onSubmit?: () => void
  initialDraft?: TaskDraft
  onSave?: (draft: TaskDraft) => void
  submitLabel?: string
  hideStatus?: boolean
}) {
  const { setTasks } = useProjectTasks(project)
  const [draft, setDraft] = React.useState<TaskDraft>(() => initialDraft ?? getDefaultTaskDraft())

  function updateDraft<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.title.trim() || !draft.category || !draft.status || !draft.priority) return

    if (onSave) {
      onSave(draft)
      return
    }

    const nextTask: ProjectTask = {
      id: `${project.id}-task-${crypto.randomUUID()}`,
      title: draft.title.trim(),
      assignedTo: draft.assignedTo.trim(),
      category: draft.category,
      description: draft.description.trim(),
      dueDate: draft.dueDate,
      status: draft.status,
      priority: draft.priority,
    }

    setTasks((current) => [nextTask, ...current])
    setDraft(getDefaultTaskDraft())
    onSubmit?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="task-title" className="text-sm font-medium text-slate-700">
          Task title <span className="text-rose-500">*</span>
        </label>
        <Input
          id="task-title"
          value={draft.title}
          onChange={(event) => updateDraft('title', event.target.value)}
          placeholder="e.g. Finalize shelter NFI dispatch plan"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          label="Category"
          value={draft.category}
          onChange={(value) => updateDraft('category', value)}
          options={CATEGORIES}
          required
        />
        <div className="space-y-1.5">
          <label htmlFor="task-assigned-to" className="text-sm font-medium text-slate-700">
            Assigned to
          </label>
          <Input
            id="task-assigned-to"
            value={draft.assignedTo}
            onChange={(event) => updateDraft('assignedTo', event.target.value)}
            placeholder="Name or role"
          />
        </div>
        {!hideStatus && (
          <FormSelect
            label="Status"
            value={draft.status}
            onChange={(value) => updateDraft('status', value as TaskStatus)}
            options={TASK_STATUSES}
            required
          />
        )}
        <FormSelect
          label="Priority"
          value={draft.priority}
          onChange={(value) => updateDraft('priority', value as TaskPriority)}
          options={PRIORITIES}
          required
        />
        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="task-due-date" className="text-sm font-medium text-slate-700">
            Due date
          </label>
          <Input
            id="task-due-date"
            type="date"
            value={draft.dueDate}
            onChange={(event) => updateDraft('dueDate', event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="task-description" className="text-sm font-medium text-slate-700">Description</label>
        <Textarea
          id="task-description"
          value={draft.description}
          onChange={(event) => updateDraft('description', event.target.value)}
          placeholder="Provide additional context or requirements for this task"
          rows={4}
        />
      </div>

      <Button type="submit" className="h-10 w-full bg-orange-500 text-white hover:bg-orange-600">
        {submitLabel}
      </Button>
    </form>
  )
}
