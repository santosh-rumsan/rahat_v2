import * as React from 'react'
import type { ProjectSummary } from '@rahataid/plugin-sdk'
import { Button } from '@rs/ui/button'
import { Badge } from '@rs/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@rs/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@rs/ui/alert-dialog'
import { ClipboardList, Pencil, RefreshCw, FolderOpen, Trash2, Upload, FileText, Download, X } from 'lucide-react'
import { type TaskStatus, type StatusLog, type TaskDocument, priorityBadgeClassNames, priorityLabel, statusBadgeClassNames } from './types.js'
import { useProjectTasks } from './hooks.js'
import { ChangeStatusDialog } from './components/change-status-dialog.js'
import { StatusLogList } from './components/status-log-list.js'
import { getTaskTypeDefinition } from './task-types/registry.js'

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

  const taskTypeDef = getTaskTypeDefinition(task.taskType ?? 'default')
  const DesignerComponent = taskTypeDef?.designer

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

  function handleDesignerUpdate(designerData: Record<string, unknown>) {
    setTasks((current) =>
      current.map((t) => (t.id === taskId ? { ...t, designerData } : t))
    )
  }

  function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const doc: TaskDocument = {
          id: crypto.randomUUID(),
          name: file.name,
          dataUrl: event.target?.result as string,
          uploadedAt: new Date().toISOString(),
        }
        setTasks((current) =>
          current.map((t) =>
            t.id === taskId ? { ...t, documents: [...(t.documents ?? []), doc] } : t
          )
        )
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function handleDocumentDelete(docId: string) {
    setTasks((current) =>
      current.map((t) =>
        t.id === taskId ? { ...t, documents: (t.documents ?? []).filter((d) => d.id !== docId) } : t
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
                {taskTypeDef && taskTypeDef.type !== 'default' && (
                  <Badge className="bg-violet-100 text-violet-700">{taskTypeDef.label}</Badge>
                )}
                {task.triggerType === 'automated' && (
                  <Badge className="bg-sky-100 text-sky-700">Automated</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {task.triggerType !== 'automated' && (
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-gray-600 rounded-xl"
                onClick={() => setStatusDialogOpen(true)}
              >
                <RefreshCw size={13} />
                Change Status
              </Button>
            )}
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
          {DesignerComponent && (
            <TabsTrigger value="designer">{taskTypeDef?.designerTabLabel ?? 'Designer'}</TabsTrigger>
          )}
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
                <p className="text-xs text-gray-400 mb-1">Task Type</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{taskTypeDef?.label ?? task.taskType}</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Trigger</p>
                <p className="text-sm font-semibold text-[#1a1a1a] capitalize">{task.triggerType ?? 'manual'}</p>
              </div>
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
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Documents</p>
                <p className="text-xs text-gray-400 mt-0.5">{(task.documents ?? []).length} file{(task.documents ?? []).length !== 1 ? 's' : ''} attached</p>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
                <Upload size={12} />
                Add Document
                <input type="file" multiple className="hidden" onChange={handleDocumentUpload} />
              </label>
            </div>

            {(task.documents ?? []).length === 0 ? (
              <label className="flex flex-col items-center justify-center gap-3 py-14 border border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <FolderOpen className="size-10 text-slate-300" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-500">No documents attached</p>
                  <p className="text-xs text-slate-400 mt-0.5">Click to upload files</p>
                </div>
                <input type="file" multiple className="hidden" onChange={handleDocumentUpload} />
              </label>
            ) : (
              <div className="space-y-2">
                {(task.documents ?? []).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group">
                    <FileText size={16} className="text-orange-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                      <p className="text-[10px] text-gray-400">{new Date(doc.uploadedAt).toLocaleString()}</p>
                    </div>
                    <a
                      href={doc.dataUrl}
                      download={doc.name}
                      className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Download"
                    >
                      <Download size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDocumentDelete(doc.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {DesignerComponent && (
          <TabsContent value="designer" className="flex-1 overflow-y-auto px-8 py-6 mt-0">
            <DesignerComponent
              project={project}
              task={task}
              onUpdate={handleDesignerUpdate}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
