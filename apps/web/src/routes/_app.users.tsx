import { createFileRoute } from '@tanstack/react-router'
import {
  Search,
  Plus,
  ShieldCheck,
  User,
  Mail,
  Clock,
  MoreHorizontal,
  SlidersHorizontal,
  KeyRound,
  Pencil,
} from 'lucide-react'
import * as React from 'react'
import { cn } from '@rs/ui'

export const Route = createFileRoute('/_app/users')({ component: Users })

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-700',
  Manager: 'bg-blue-100 text-blue-700',
  Field: 'bg-orange-100 text-orange-700',
  Finance: 'bg-green-100 text-green-700',
  Viewer: 'bg-gray-100 text-gray-600',
}

const USERS = [
  { id: '1', name: 'Anita Sharma', email: 'anita.sharma@rahat.io', role: 'Admin', lastLogin: 'Mar 12, 2025 · 9:41 AM', status: 'Active', avatar: 'https://i.pravatar.cc/96?img=1', phone: '+977-980-000-0001', joinedDate: 'Jan 3, 2024', projects: 4, actionsCount: 142 },
  { id: '2', name: 'Bikash Thapa', email: 'bikash.thapa@rahat.io', role: 'Manager', lastLogin: 'Mar 12, 2025 · 8:15 AM', status: 'Active', avatar: 'https://i.pravatar.cc/96?img=8', phone: '+977-980-000-0002', joinedDate: 'Feb 14, 2024', projects: 3, actionsCount: 87 },
  { id: '3', name: 'Chandani Rai', email: 'chandani.rai@rahat.io', role: 'Field', lastLogin: 'Mar 11, 2025 · 4:02 PM', status: 'Active', avatar: 'https://i.pravatar.cc/96?img=5', phone: '+977-980-000-0003', joinedDate: 'Mar 1, 2024', projects: 2, actionsCount: 53 },
  { id: '4', name: 'Deepak Karki', email: 'deepak.karki@rahat.io', role: 'Finance', lastLogin: 'Mar 11, 2025 · 2:30 PM', status: 'Active', avatar: 'https://i.pravatar.cc/96?img=12', phone: '+977-980-000-0004', joinedDate: 'Apr 22, 2024', projects: 3, actionsCount: 61 },
  { id: '5', name: 'Elina Gurung', email: 'elina.gurung@rahat.io', role: 'Field', lastLogin: 'Mar 10, 2025 · 11:20 AM', status: 'Active', avatar: 'https://i.pravatar.cc/96?img=9', phone: '+977-980-000-0005', joinedDate: 'May 7, 2024', projects: 1, actionsCount: 29 },
  { id: '6', name: 'Fikir Magar', email: 'fikir.magar@rahat.io', role: 'Manager', lastLogin: 'Mar 8, 2025 · 3:45 PM', status: 'Active', avatar: 'https://i.pravatar.cc/96?img=15', phone: '+977-980-000-0006', joinedDate: 'Jun 18, 2024', projects: 2, actionsCount: 74 },
  { id: '7', name: 'Gita Tamang', email: 'gita.tamang@rahat.io', role: 'Viewer', lastLogin: 'Mar 5, 2025 · 10:00 AM', status: 'Inactive', avatar: 'https://i.pravatar.cc/96?img=20', phone: '+977-980-000-0007', joinedDate: 'Jul 30, 2024', projects: 0, actionsCount: 5 },
  { id: '8', name: 'Hari Bhandari', email: 'hari.bhandari@rahat.io', role: 'Field', lastLogin: 'Mar 12, 2025 · 7:55 AM', status: 'Active', avatar: 'https://i.pravatar.cc/96?img=3', phone: '+977-980-000-0008', joinedDate: 'Aug 12, 2024', projects: 2, actionsCount: 38 },
  { id: '9', name: 'Indira Pokhrel', email: 'indira.pokhrel@rahat.io', role: 'Finance', lastLogin: 'Mar 9, 2025 · 1:10 PM', status: 'Active', avatar: 'https://i.pravatar.cc/96?img=25', phone: '+977-980-000-0009', joinedDate: 'Sep 5, 2024', projects: 3, actionsCount: 66 },
  { id: '10', name: 'Jagat Shrestha', email: 'jagat.shrestha@rahat.io', role: 'Viewer', lastLogin: 'Feb 28, 2025 · 9:00 AM', status: 'Inactive', avatar: 'https://i.pravatar.cc/96?img=6', phone: '+977-980-000-0010', joinedDate: 'Oct 20, 2024', projects: 0, actionsCount: 2 },
]

function Users() {
  const [search, setSearch] = React.useState('')
  const [selectedId, setSelectedId] = React.useState<string>(USERS[0].id)

  const filtered = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  )

  const selected = USERS.find((u) => u.id === selectedId) ?? USERS[0]

  return (
    <div className="flex h-full bg-[#f0f0f0] overflow-hidden">
      {/* Left: user list */}
      <div className="w-[280px] flex-shrink-0 flex flex-col bg-[#f0f0f0]">
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-[#1a1a1a]">Users</h2>
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white/50">
                <SlidersHorizontal size={15} />
              </button>
              <button className="flex items-center gap-1 bg-[#1a1a1a] hover:bg-[#333] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
                <Plus size={13} />
                Invite
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">{USERS.length} total · {USERS.filter(u => u.status === 'Active').length} active</p>

          {/* Search */}
          <div className="relative mt-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedId(u.id)}
              className={cn(
                'w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors',
                u.id === selectedId ? 'bg-white shadow-sm' : 'hover:bg-white/50'
              )}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span
                  className={cn(
                    'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#f0f0f0]',
                    u.status === 'Active' ? 'bg-green-400' : 'bg-gray-300'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1a1a1a] truncate">{u.name}</span>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-1',
                      ROLE_COLORS[u.role]
                    )}
                  >
                    {u.role}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-center text-gray-400 py-8">No users found</p>
          )}
        </div>
      </div>

      {/* Right: user detail */}
      <div className="flex-1 bg-white rounded-l-3xl overflow-hidden flex flex-col min-w-0">
        {/* Detail header */}
        <div className="px-8 pt-7 pb-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-5">
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-orange-100">
                <img src={selected.avatar} alt={selected.name} className="w-full h-full object-cover" />
              </div>
              <div className="pt-1">
                <h1 className="text-3xl font-black text-[#1a1a1a] leading-tight">{selected.name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={cn(
                      'flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold',
                      ROLE_COLORS[selected.role]
                    )}
                  >
                    {selected.role === 'Admin' ? <ShieldCheck size={11} /> : <User size={11} />}
                    {selected.role}
                  </span>
                  <span
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-semibold',
                      selected.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {selected.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-gray-400" />
                    {selected.email}
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
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors">
                <KeyRound size={13} />
                Reset password
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
              <p className="text-xs text-gray-400 mb-1">Last login</p>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400" />
                <p className="text-sm font-semibold text-[#1a1a1a]">{selected.lastLogin}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Joined</p>
              <p className="text-sm font-semibold text-[#1a1a1a]">{selected.joinedDate}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Projects assigned</p>
              <p className="text-sm font-semibold text-[#1a1a1a]">{selected.projects}</p>
            </div>
          </div>

          {/* Profile fields */}
          <h3 className="text-base font-bold text-[#1a1a1a] mb-4">Account details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            {[
              { label: 'Full name', value: selected.name },
              { label: 'Email address', value: selected.email },
              { label: 'Phone', value: selected.phone },
              { label: 'Role', value: selected.role },
              { label: 'Status', value: selected.status },
              { label: 'Total actions', value: String(selected.actionsCount) },
            ].map((field) => (
              <div key={field.label}>
                <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
