import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { Button } from '@rs/ui/button'
import { Input } from '@rs/ui/input'
import { Textarea } from '@rs/ui/textarea'
import { ChevronLeft, Zap, Hand, CheckCircle2 } from 'lucide-react'
import { type TaskDraft, type TaskStatus, type TaskPriority, type TaskType, type TriggerType, CATEGORIES, TASK_STATUSES, PRIORITIES, getDefaultTaskDraft } from '../types.js'
import { type ProjectTask } from '../types.js'
import { useProjectTasks } from '../hooks.js'
import { FormSelect } from './form-select.js'
import { getRegisteredTaskTypes } from '../task-types/registry.js'

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
  const taskTypes = getRegisteredTaskTypes()
  const isEditMode = !!initialDraft
  const [step, setStep] = React.useState<1 | 2 | 3>(isEditMode ? 3 : 1)

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
      taskType: draft.taskType,
      triggerType: draft.triggerType,
    }

    setTasks((current) => [nextTask, ...current])
    setDraft(getDefaultTaskDraft())
    onSubmit?.()
  }

  // Step 1: Task type selection
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#1a1a1a]">What type of task?</h2>
          <p className="text-sm text-gray-400 mt-1">Choose the task type to get started.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {taskTypes.map((t) => {
            const isSelected = draft.taskType === t.type
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => updateDraft('taskType', t.type as TaskType)}
                className={[
                  'text-left p-4 rounded-xl border-2 transition-all',
                  isSelected
                    ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-300'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                  {isSelected && <CheckCircle2 size={16} className="text-orange-500 flex-shrink-0" />}
                </div>
              </button>
            )
          })}
        </div>
        <Button
          type="button"
          className="h-10 w-full bg-orange-500 text-white hover:bg-orange-600"
          onClick={() => setStep(2)}
        >
          Next
        </Button>
      </div>
    )
  }

  // Step 2: Trigger type selection
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#1a1a1a]">How is this task triggered?</h2>
          <p className="text-sm text-gray-400 mt-1">Select how this task will be initiated.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { value: 'manual', label: 'Manual', icon: Hand, description: 'Triggered by a team member manually' },
              { value: 'automated', label: 'Automated', icon: Zap, description: 'Triggered automatically by the system' },
            ] as const
          ).map(({ value, label, icon: Icon, description }) => {
            const isSelected = draft.triggerType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateDraft('triggerType', value as TriggerType)}
                className={[
                  'text-left p-4 rounded-xl border-2 transition-all',
                  isSelected
                    ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-300'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={15} className={isSelected ? 'text-orange-500' : 'text-slate-400'} />
                    <p className="text-sm font-semibold text-slate-800">{label}</p>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="text-orange-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-slate-400">{description}</p>
              </button>
            )
          })}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1 flex items-center gap-1.5"
            onClick={() => setStep(1)}
          >
            <ChevronLeft size={14} />
            Back
          </Button>
          <Button
            type="button"
            className="h-10 flex-1 bg-orange-500 text-white hover:bg-orange-600"
            onClick={() => setStep(3)}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }

  // Step 3: Rest of the form
  const shouldHideStatus = !isEditMode || hideStatus

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditMode && (
        <button
          type="button"
          onClick={() => setStep(2)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-2"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      )}

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
        {draft.triggerType !== 'automated' && (
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
        )}
        {!shouldHideStatus && (
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
