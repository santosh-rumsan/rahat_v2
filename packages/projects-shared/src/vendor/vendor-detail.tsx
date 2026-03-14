import * as React from 'react'
import { ArrowLeft, Pencil, Trash2, Mail, Phone, MapPin, Building2 } from 'lucide-react'
import { cn } from '@rs/ui'
import type { Vendor } from '@rahataid/sdk'
import { useDeleteVendor } from './queries.js'

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Vendor['status'], string> = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-500',
}

// ─── component ───────────────────────────────────────────────────────────────

export interface VendorDetailProps {
  vendor: Vendor
  onBack?: () => void
  onEdit?: (vendor: Vendor) => void
  onDeleted?: () => void
}

export function VendorDetail({ vendor, onBack, onEdit, onDeleted }: VendorDetailProps) {
  const deleteMutation = useDeleteVendor()
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    deleteMutation.mutate(vendor.id, { onSuccess: () => onDeleted?.() })
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      {/* Page header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            Back to Vendors
          </button>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-black text-orange-500">
                {vendor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="pt-1">
              <h1 className="text-2xl font-black text-[#1a1a1a] leading-tight">{vendor.name}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', STATUS_COLORS[vendor.status])}>
                  {vendor.status}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600">
                  {vendor.type}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit?.(vendor)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
            >
              <Pencil size={13} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50',
                confirmDelete
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'text-red-600 bg-red-50 hover:bg-red-100'
              )}
            >
              <Trash2 size={13} />
              {deleteMutation.isPending ? 'Deleting…' : confirmDelete ? 'Confirm delete' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-8 max-w-3xl space-y-8">
        {/* Contact info cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1.5">Contact person</p>
            <p className="text-sm font-semibold text-[#1a1a1a]">{vendor.contactPerson}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1.5">Phone</p>
            <div className="flex items-center gap-1.5">
              <Phone size={12} className="text-gray-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-[#1a1a1a]">{vendor.phone || '—'}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1.5">Location</p>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-[#1a1a1a]">{vendor.location || '—'}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Vendor details</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {[
              { label: 'Vendor name', value: vendor.name, icon: <Building2 size={13} className="text-gray-400" /> },
              { label: 'Business type', value: vendor.type },
              { label: 'Email', value: vendor.email, icon: <Mail size={13} className="text-gray-400" /> },
              { label: 'Phone', value: vendor.phone || '—', icon: <Phone size={13} className="text-gray-400" /> },
              { label: 'Status', value: vendor.status },
              { label: 'Location', value: vendor.location || '—', icon: <MapPin size={13} className="text-gray-400" /> },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                <div className="flex items-center gap-1.5">
                  {field.icon}
                  <p className="text-sm font-semibold text-[#1a1a1a]">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {vendor.notes && (
          <div>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-2">Notes</h2>
            <p className="text-sm text-gray-500">{vendor.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
