import * as React from 'react'
import { Button } from '@rs/ui/button'
import { Badge } from '@rs/ui/badge'
import { ArrowUpRight, X, RefreshCw, FolderOpen } from 'lucide-react'
import { type ProjectTask, type TaskStatus, priorityBadgeClassNames, priorityLabel, statusBadgeClassNames } from './types.js'
import { ChangeStatusDialog } from './components/change-status-dialog.js'
import { PillTabs } from './components/pill-tabs.js'
import { StatusLogList, EmptyTabPlaceholder } from './components/status-log-list.js'

export function TaskPreviewPanel({
  task,
  projectId,
  onClose,
  onStatusChange,
}: {
  task: ProjectTask
  projectId: string
  onClose: () => void
  onStatusChange: (taskId: string, status: TaskStatus, notes: string, fileName?: string) => void
}) {
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)

  return (
    <div className="w-[400px] shrink-0 border-l border-slate-200 flex flex-col overflow-hidden">
      <ChangeStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        taskTitle={task.title}
        currentStatus={task.status}
        onSubmit={(status, notes, fileName) => onStatusChange(task.id, status, notes, fileName)}
      />
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="size-4" />
        </button>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2.5 gap-1"
            onClick={() => setStatusDialogOpen(true)}
          >
            <RefreshCw className="size-3" />
            Change Status
          </Button>
          <a href={`/projects/${projectId}/tasks/${task.id}/edit`}>
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2.5">Edit</Button>
          </a>
          <a href={`/projects/${projectId}/tasks/${task.id}`}>
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs px-2.5 gap-1">
              <ArrowUpRight className="size-3" />
              View
            </Button>
          </a>
        </div>
      </div>

      <PillTabs>
        {(active) => (
          <>
            {active === 'Info' && (
              <div className="overflow-y-auto h-full p-5 space-y-4">
                <p className="text-sm font-semibold text-slate-900 leading-snug">{task.title}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={priorityBadgeClassNames[task.priority]}>{priorityLabel[task.priority]}</Badge>
                  <Badge className={statusBadgeClassNames[task.status]}>{task.status}</Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-slate-500 leading-relaxed">{task.description}</p>
                )}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Category</p>
                    <p className="mt-1 text-sm text-slate-800">{task.category}</p>
                  </div>
                  {task.assignedTo && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Assigned to</p>
                      <p className="mt-1 text-sm text-slate-800">{task.assignedTo}</p>
                    </div>
                  )}
                  {task.dueDate && (
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Due date</p>
                      <p className="mt-1 text-sm text-slate-800">{task.dueDate}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {active === 'Logs' && (
              <div className="overflow-y-auto h-full">
                <StatusLogList logs={task.statusLogs ?? []} compact />
              </div>
            )}
            {active === 'Documents' && <EmptyTabPlaceholder icon={FolderOpen} label="No documents attached." />}
          </>
        )}
      </PillTabs>
    </div>
  )
}
