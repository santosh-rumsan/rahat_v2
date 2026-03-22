import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Upload, Link, FileJson, X } from 'lucide-react'
import * as React from 'react'
import { getPlugin } from '../plugins'
import { useProjects } from '@rahataid/projects-shared'
import { createIndexedDbProjectImportAdapter, importProjectDump } from '@rahataid/sdk'
import { toast } from '@rs/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@rs/ui/dialog'

export const Route = createFileRoute('/_app/projects/')({ component: Projects })

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Planning: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-gray-100 text-gray-600',
  Suspended: 'bg-red-100 text-red-600',
}

type ImportTab = 'file' | 'url'

function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [tab, setTab] = React.useState<ImportTab>('file')
  const [url, setUrl] = React.useState('')
  const [isDragging, setIsDragging] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function reset() {
    setUrl('')
    setTab('file')
    setIsImporting(false)
  }

  function handleClose() {
    if (isImporting) return
    reset()
    onOpenChange(false)
  }

  async function runImport(jsonText: string) {
    setIsImporting(true)
    try {
      const result = await importProjectDump(
        jsonText,
        createIndexedDbProjectImportAdapter(),
        { includeActivities: true }
      )
      await queryClient.invalidateQueries()
      toast.success(`Imported ${result.projectName}`)
      reset()
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed'
      toast.error(message)
      setIsImporting(false)
    }
  }

  async function handleFile(file: File) {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      toast.error('Please select a JSON file')
      return
    }
    await runImport(await file.text())
  }

  async function handleUrlImport(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    try {
      const response = await fetch(trimmed)
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
      await runImport(await response.text())
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch URL'
      toast.error(message)
      setIsImporting(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Project</DialogTitle>
          <DialogDescription>
            Import a project from a JSON file or a URL.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mt-1">
          {(['file', 'url'] as ImportTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === t
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'file' ? <Upload size={14} /> : <Link size={14} />}
              {t === 'file' ? 'From File' : 'From URL'}
            </button>
          ))}
        </div>

        {tab === 'file' && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
              isDragging
                ? 'border-brand-400 bg-brand-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                e.target.value = ''
              }}
            />
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
              <FileJson size={22} className="text-gray-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Drop a JSON file here
              </p>
              <p className="text-xs text-gray-400 mt-0.5">or click to browse</p>
            </div>
          </div>
        )}

        {tab === 'url' && (
          <form onSubmit={handleUrlImport} className="mt-1 space-y-3">
            <div className="relative">
              <Link size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                placeholder="https://example.com/project.json"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!url.trim() || isImporting}
              className="w-full py-2.5 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing…' : 'Import from URL'}
            </button>
          </form>
        )}

        {isImporting && tab === 'file' && (
          <p className="text-center text-sm text-gray-500 mt-1">Importing…</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Projects() {
  const [search, setSearch] = React.useState('')
  const [importOpen, setImportOpen] = React.useState(false)
  const navigate = useNavigate()
  const { data: projects = [], isLoading } = useProjects()
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />

      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} projects total</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            <Upload size={16} />
            Import Project
          </button>
          <button
            onClick={() => navigate({ to: '/projects/new' })}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
          >
            <Plus size={16} />
            Add New Project
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-8 pt-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 py-6 grid grid-cols-3 gap-5 content-start">
        {isLoading && (
          <div className="col-span-3 py-16 text-center text-gray-400 text-sm">
            Loading projects…
          </div>
        )}
        {!isLoading && filtered.map((p) => {
          const plugin = getPlugin(p.projectType)
          return (
            <div
              key={p.id}
              onClick={() => navigate({ to: '/projects/$id', params: { id: p.id } })}
              className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span
                  className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {p.status}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{p.name}</h3>
                  {plugin && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                      {plugin.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{p.location}</p>
                <div className="flex items-center justify-between pt-2 text-xs text-gray-500 border-t border-gray-100">
                  <span>{p.beneficiaries.toLocaleString()} beneficiaries</span>
                  <span className="font-medium text-gray-700">{p.budget}</span>
                </div>
              </div>
            </div>
          )
        })}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center text-gray-400 text-sm">
            {search ? `No projects found matching "${search}"` : 'No projects yet. Create your first project.'}
          </div>
        )}
      </div>
    </div>
  )
}
