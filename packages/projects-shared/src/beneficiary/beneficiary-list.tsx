import * as React from 'react'
import {
  Search,
  Plus,
  SlidersHorizontal,
  MapPin,
  Phone,
  Calendar,
  Users,
  MoreHorizontal,
  Pencil,
} from 'lucide-react'
import { cn } from '@rs/ui'
import type { Beneficiary } from './types.js'

const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: '1', name: 'Gita Sharma', age: 34, gender: 'Female', location: 'Ward 5, Kathmandu', phone: '9841234567', status: 'Verified', enrolledDate: '2026-02-10', householdSize: 4 },
  { id: '2', name: 'Raju Tamang', age: 45, gender: 'Male', location: 'Ward 2, Lalitpur', phone: '9852345678', status: 'Pending', enrolledDate: '2026-02-12', householdSize: 6 },
  { id: '3', name: 'Sunita Rai', age: 28, gender: 'Female', location: 'Ward 8, Bhaktapur', phone: '9863456789', status: 'Verified', enrolledDate: '2026-02-14', householdSize: 3 },
  { id: '4', name: 'Dipak Magar', age: 52, gender: 'Male', location: 'Ward 1, Kathmandu', status: 'Inactive', enrolledDate: '2026-02-15', householdSize: 5 },
  { id: '5', name: 'Kamala Thapa', age: 39, gender: 'Female', location: 'Ward 3, Lalitpur', phone: '9874567890', status: 'Verified', enrolledDate: '2026-02-18', householdSize: 2 },
  { id: '6', name: 'Bikram Gurung', age: 31, gender: 'Male', location: 'Ward 6, Kathmandu', phone: '9885678901', status: 'Pending', enrolledDate: '2026-02-20', householdSize: 4 },
  { id: '7', name: 'Saraswati Limbu', age: 44, gender: 'Female', location: 'Ward 9, Bhaktapur', phone: '9896789012', status: 'Verified', enrolledDate: '2026-02-22', householdSize: 5 },
  { id: '8', name: 'Hari Prasad Oli', age: 58, gender: 'Male', location: 'Ward 4, Lalitpur', status: 'Inactive', enrolledDate: '2026-02-24', householdSize: 3, notes: 'Relocated to another district' },
  { id: '9', name: 'Anita Shrestha', age: 26, gender: 'Female', location: 'Ward 7, Kathmandu', phone: '9807890123', status: 'Verified', enrolledDate: '2026-02-26', householdSize: 2 },
  { id: '10', name: 'Narayan Bista', age: 37, gender: 'Male', location: 'Ward 11, Lalitpur', phone: '9818901234', status: 'Pending', enrolledDate: '2026-02-28', householdSize: 6 },
  { id: '11', name: 'Puja Karki', age: 22, gender: 'Female', location: 'Ward 2, Bhaktapur', phone: '9829012345', status: 'Verified', enrolledDate: '2026-03-01', householdSize: 4 },
  { id: '12', name: 'Mohan Khatri', age: 49, gender: 'Male', location: 'Ward 14, Kathmandu', phone: '9840123456', status: 'Inactive', enrolledDate: '2026-03-03', householdSize: 7 },
]

const STATUS_COLORS: Record<Beneficiary['status'], string> = {
  Verified: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-500',
}

export interface BeneficiaryListProps {
  beneficiaries?: Beneficiary[]
  onAdd?: () => void
}


export function BeneficiaryList({
  beneficiaries = MOCK_BENEFICIARIES,
  onAdd,
}: BeneficiaryListProps) {
  const [search, setSearch] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string>(beneficiaries[0]?.id ?? '')

  const filtered = beneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.phone ?? '').includes(search) ||
      b.location.toLowerCase().includes(search.toLowerCase())
  )

  const selected = beneficiaries.find((b) => b.id === selectedId) ?? beneficiaries[0]

  return (
    <div className="flex h-full bg-[#f0f0f0] overflow-hidden">
      {/* Left: beneficiary list */}
      <div className="w-[280px] flex-shrink-0 flex flex-col bg-[#f0f0f0]">
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Beneficiaries</h2>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white/50">
                <SlidersHorizontal size={15} />
              </button>
              {onAdd && (
                <button
                  onClick={onAdd}
                  className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus size={13} />
                  Add
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400">
            {beneficiaries.length} total ·{' '}
            {beneficiaries.filter((b) => b.status === 'Verified').length} verified
          </p>

          {/* Search */}
          <div className="relative mt-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search beneficiaries…"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.currentTarget.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
          {filtered.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              className={cn(
                'w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors',
                b.id === selectedId ? 'bg-white shadow-sm' : 'hover:bg-white/50'
              )}
            >
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
                {b.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1a1a1a] truncate">{b.name}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-1',
                      STATUS_COLORS[b.status]
                    )}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{b.location}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-center text-gray-400 py-8">No beneficiaries found</p>
          )}
        </div>
      </div>

      {/* Right: beneficiary detail */}
      {selected && (
        <div className="flex-1 bg-white rounded-l-3xl overflow-hidden flex flex-col min-w-0">
          {/* Detail header */}
          <div className="px-8 pt-7 pb-5 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl font-black text-orange-500">
                    {selected.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="pt-1">
                  <h1 className="text-3xl font-black text-[#1a1a1a] leading-tight">{selected.name}</h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-semibold',
                        STATUS_COLORS[selected.status]
                      )}
                    >
                      {selected.status}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600">
                      {selected.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400" />
                      {selected.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors">
                  <Pencil size={13} />
                  Edit
                </button>
                <button className="text-gray-400 hover:text-gray-700 p-2 rounded-xl hover:bg-gray-100">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Detail body */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Enrolled</p>
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  <p className="text-sm font-semibold text-[#1a1a1a]">{selected.enrolledDate}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Household size</p>
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-gray-400" />
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {selected.householdSize ?? '—'} members
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs text-gray-400 mb-1">Phone</p>
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" />
                  <p className="text-sm font-semibold text-[#1a1a1a]">{selected.phone ?? '—'}</p>
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-[#1a1a1a] mb-4">Profile details</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              {[
                { label: 'Full name', value: selected.name },
                { label: 'Age', value: String(selected.age) },
                { label: 'Gender', value: selected.gender },
                { label: 'Phone', value: selected.phone ?? '—' },
                { label: 'Location', value: selected.location },
                { label: 'Status', value: selected.status },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{field.value}</p>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="mt-8">
                <h3 className="text-base font-bold text-[#1a1a1a] mb-2">Notes</h3>
                <p className="text-sm text-gray-500">{selected.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
