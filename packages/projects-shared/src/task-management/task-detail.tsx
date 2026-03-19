import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { Button } from '@rs/ui/button'
import { Badge } from '@rs/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@rs/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@rs/ui/alert-dialog'
import { ClipboardList, Pencil, RefreshCw, FolderOpen, Trash2 } from 'lucide-react'
import { type TaskStatus, type StatusLog, priorityBadgeClassNames, priorityLabel, statusBadgeClassNames } from './types.js'
import { useProjectTasks } from './hooks.js'
import { ChangeStatusDialog } from './components/change-status-dialog.js'
import { StatusLogList } from './components/status-log-list.js'

export function TaskManagementDetailPage({ project, taskId }: { project: ProjectSummary; taskId: string }) {
  const { tasks, setTasks } = useProjectTasks(project)
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const task = tasks.find((t) => t.id === taskId) ?? null

  if (!task) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Task not found.
      </div>
    )
  }

  function handleDelete() {
    setTasks((current) => current.filter((t) => t.id !== taskId))
    window.history.back()
  }

  function handleStatusChange(status: TaskStatus, notes: string, fileName?: string) {
    const log: StatusLog = {
      id: crypto.randomUUID(),
      status,
      notes,
      fileName,
      timestamp: new Date().toISOString(),
    }
    setTasks((current) =>
      current.map((t) =>
        t.id === taskId
          ? { ...t, status, statusLogs: [...(t.statusLogs ?? []), log] }
          : t
      )
    )
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ChangeStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        taskTitle={task.title}
        currentStatus={task.status}
        onSubmit={handleStatusChange}
      />
      {/* Header */}
      <div className="px-8 pt-7 pb-5 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-orange-100">
              <ClipboardList size={18} className="text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1a1a1a]">{task.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={priorityBadgeClassNames[task.priority]}>{priorityLabel[task.priority]}</Badge>
                <Badge className={statusBadgeClassNames[task.status]}>{task.status}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-gray-600 rounded-xl"
              onClick={() => setStatusDialogOpen(true)}
            >
              <RefreshCw size={13} />
              Change Status
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-gray-600 rounded-xl"
              onClick={() => { window.location.href = `/projects/${project.id}/tasks/${task.id}/edit` }}
            >
              <Pencil size={11} />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-red-600 rounded-xl border-red-200 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 size={13} />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="flex flex-col flex-1 min-h-0 mt-4">
        <TabsList className="flex-shrink-0">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="flex-1 overflow-y-auto px-8 py-6 mt-0">
          <div className="max-w-2xl space-y-6">
            {task.description && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Category</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{task.category}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Assigned to</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{task.assignedTo || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Priority</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{priorityLabel[task.priority]}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{task.status}</p>
              </div>
              {task.dueDate && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Due Date</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{task.dueDate}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="flex-1 overflow-y-auto px-8 mt-0">
          <div className="max-w-2xl">
            <StatusLogList logs={task.statusLogs ?? []} />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="flex-1 overflow-y-auto px-8 py-6 mt-0">
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
            <FolderOpen className="size-10 opacity-40" />
            <p className="text-sm">No documents attached.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
