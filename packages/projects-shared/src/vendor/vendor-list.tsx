import * as React from 'react'
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Upload, FileJson, Link, X } from 'lucide-react'
import { cn } from '@rs/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@rs/ui/dialog'
import { toast } from '@rs/ui/toast'
import type { Vendor, CreateVendorInput } from '@rahataid/sdk'
import { useVendors, useDeleteVendor, useImportVendors } from './queries.js'

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Vendor['status'], string> = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-500',
}

// ─── import dialog ────────────────────────────────────────────────────────────

type ImportTab = 'file' | 'url'

function ImportDialog({
  open,
  onOpenChange,
  onImport,
  isImporting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (records: CreateVendorInput[]) => void
  isImporting: boolean
}) {
  const [tab, setTab] = React.useState<ImportTab>('file')
  const [url, setUrl] = React.useState('')
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function reset() {
    setUrl('')
    setTab('file')
    setError(null)
  }

  function handleClose() {
    if (isImporting) return
    reset()
    onOpenChange(false)
  }

  function parseAndImport(jsonText: string) {
    try {
      const json = JSON.parse(jsonText)
      if (json.type !== 'vendor') {
        setError(`Type mismatch: expected "vendor", got "${json.type ?? 'unknown'}"`)
        return
      }
      if (!Array.isArray(json.data)) {
        setError('Invalid format: "data" must be an array')
        return
      }
      setError(null)
      onImport(json.data as CreateVendorInput[])
    } catch {
      setError('Invalid JSON file')
    }
  }

  async function handleFile(file: File) {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setError('Please select a JSON file')
      return
    }
    parseAndImport(await file.text())
  }

  async function handleUrlImport(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    try {
      const response = await fetch(trimmed)
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
      parseAndImport(await response.text())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch URL')
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
          <DialogTitle>Import Vendors</DialogTitle>
          <DialogDescription>
            Import vendors from a JSON file or a URL. File must have <code>type: "vendor"</code>.
          </DialogDescription>
        </DialogHeader>

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
                ? 'border-orange-400 bg-orange-50'
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
              <p className="text-sm font-medium text-gray-700">Drop a JSON file here</p>
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
                placeholder="https://example.com/vendors.json"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
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
              className="w-full py-2.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isImporting ? 'Importing…' : 'Import from URL'}
            </button>
          </form>
        )}

        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        {isImporting && tab === 'file' && (
          <p className="text-center text-sm text-gray-500 mt-1">Importing…</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── component ───────────────────────────────────────────────────────────────

export interface VendorListProps {
  onAdd?: () => void
  onEdit?: (vendor: Vendor) => void
  onRowClick?: (vendor: Vendor) => void
}

export function VendorList({ onAdd, onEdit, onRowClick }: VendorListProps) {
  const { data: vendors = [] as Vendor[], isLoading } = useVendors()
  const deleteMutation = useDeleteVendor()
  const importMutation = useImportVendors()
  const [search, setSearch] = React.useState('')
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null)
  const [importOpen, setImportOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  function handleImport(records: CreateVendorInput[]) {
    importMutation.mutate(records, {
      onSuccess: () => {
        toast.success(`Imported ${records.length} vendor${records.length !== 1 ? 's' : ''}`)
        setImportOpen(false)
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Import failed')
      },
    })
  }

  React.useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    if (menuOpenId) document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [menuOpenId])

  const filtered = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(search.toLowerCase())
  )

  function handleDelete(id: string) {
    deleteMutation.mutate(id, { onSuccess: () => setMenuOpenId(null) })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
        isImporting={importMutation.isPending}
      />

      <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-1">{vendors.length} registered vendors</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportOpen(true)}
            disabled={importMutation.isPending}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <Upload size={15} />
            {importMutation.isPending ? 'Importing…' : 'Import'}
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Add Vendor
          </button>
        </div>
      </div>

      <div className="px-8 pt-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 px-8 py-5">
        <div className="bg-gray-50 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => onRowClick?.(v)}
                  className={cn('transition-colors', onRowClick ? 'hover:bg-white/70 cursor-pointer' : 'hover:bg-white/70')}
                >
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{v.name}</p>
                      <p className="text-xs text-gray-400">{v.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{v.type}</td>
                  <td className="px-5 py-3 text-gray-600">{v.contactPerson}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{v.phone}</td>
                  <td className="px-5 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[v.status])}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="relative" ref={menuOpenId === v.id ? menuRef : undefined}>
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === v.id ? null : v.id)}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {menuOpenId === v.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                          <button
                            onClick={() => { onEdit?.(v); setMenuOpenId(null) }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    {search ? `No vendors found matching "${search}"` : 'No vendors yet. Add one to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
