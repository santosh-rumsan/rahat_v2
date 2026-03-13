import * as React from 'react'
import { Search, Plus, Trash2, UserMinus, UserPlus, Users, X, ArrowLeft } from 'lucide-react'
import { cn } from '@rs/ui'
import type { Beneficiary, BeneficiaryGroup } from './types.js'

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

const SEED_GROUPS: BeneficiaryGroup[] = [
  { id: 'g1', name: 'Displaced Households', description: 'Families displaced due to natural disaster', beneficiaryIds: ['1', '3', '5'], createdAt: '2026-02-10' },
  { id: 'g2', name: 'Women-led Households', description: 'Households headed by women', beneficiaryIds: ['1', '7', '9', '11'], createdAt: '2026-02-12' },
  { id: 'g3', name: 'Elderly & Vulnerable', description: 'Older persons and persons with disabilities', beneficiaryIds: ['4', '8'], createdAt: '2026-02-15' },
]

const STATUS_COLORS: Record<Beneficiary['status'], string> = {
  Verified: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-500',
}

function storageKey(projectId: string) {
  return `rahat-beneficiary-groups:${projectId}`
}

function loadGroups(projectId: string): BeneficiaryGroup[] {
  try {
    const raw = localStorage.getItem(storageKey(projectId))
    if (raw) return JSON.parse(raw) as BeneficiaryGroup[]
  } catch {}
  return SEED_GROUPS
}

function saveGroups(projectId: string, groups: BeneficiaryGroup[]) {
  localStorage.setItem(storageKey(projectId), JSON.stringify(groups))
}

export { storageKey, loadGroups }

export interface BeneficiaryGroupsProps {
  projectId?: string
  beneficiaries?: Beneficiary[]
  initialGroupId?: string
  onGroupSelect?: (groupId: string | undefined) => void
}

export function BeneficiaryGroups({
  projectId = 'default',
  beneficiaries = MOCK_BENEFICIARIES,
  initialGroupId,
  onGroupSelect,
}: BeneficiaryGroupsProps) {
  const [groups, setGroups] = React.useState<BeneficiaryGroup[]>(() => loadGroups(projectId))
  const [showAddGroup, setShowAddGroup] = React.useState(false)
  const [newGroupName, setNewGroupName] = React.useState('')
  const [newGroupDescription, setNewGroupDescription] = React.useState('')

  const persist = (next: BeneficiaryGroup[]) => {
    setGroups(next)
    saveGroups(projectId, next)
  }

  function handleAddGroup() {
    if (!newGroupName.trim()) return
    const group: BeneficiaryGroup = {
      id: `g${Date.now()}`,
      name: newGroupName.trim(),
      description: newGroupDescription.trim() || undefined,
      beneficiaryIds: [],
      createdAt: new Date().toISOString().split('T')[0]!,
    }
    persist([...groups, group])
    setNewGroupName('')
    setNewGroupDescription('')
    setShowAddGroup(false)
  }

  function handleDeleteGroup(id: string) {
    persist(groups.filter((g) => g.id !== id))
    if (initialGroupId === id) onGroupSelect?.(undefined)
  }

  const selectedGroup = initialGroupId ? groups.find((g) => g.id === initialGroupId) : undefined

  if (selectedGroup) {
    return (
      <GroupDetail
        group={selectedGroup}
        groups={groups}
        beneficiaries={beneficiaries}
        onBack={() => onGroupSelect?.(undefined)}
        onPersist={persist}
      />
    )
  }

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#1a1a1a]">Groups</h1>
          <p className="text-sm text-gray-400 mt-1">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowAddGroup(true)}
          className="flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-[#333] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Plus size={14} />
          New Group
        </button>
      </div>

      <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => onGroupSelect?.(g.id)}
            className="text-left p-5 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Users size={18} className="text-orange-500" />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id) }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                title="Delete group"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">{g.name}</h3>
            {g.description && (
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">{g.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {g.beneficiaryIds.length} member{g.beneficiaryIds.length !== 1 ? 's' : ''} · {g.createdAt}
            </p>
          </button>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Users size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No groups yet</p>
            <p className="text-xs text-gray-400 mt-1">Create a group to organise beneficiaries</p>
          </div>
        )}
      </div>

      {showAddGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1a1a1a]">New Group</h2>
              <button
                onClick={() => { setShowAddGroup(false); setNewGroupName(''); setNewGroupDescription('') }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Group name *</label>
                <input
                  type="text"
                  placeholder="e.g. Displaced Households"
                  value={newGroupName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGroupName(e.currentTarget.value)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleAddGroup() }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Description</label>
                <textarea
                  placeholder="Optional description…"
                  value={newGroupDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewGroupDescription(e.currentTarget.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => { setShowAddGroup(false); setNewGroupName(''); setNewGroupDescription('') }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGroup}
                disabled={!newGroupName.trim()}
                className="px-4 py-2 text-sm font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Create group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface GroupDetailProps {
  group: BeneficiaryGroup
  groups: BeneficiaryGroup[]
  beneficiaries: Beneficiary[]
  onBack: () => void
  onPersist: (groups: BeneficiaryGroup[]) => void
}

function GroupDetail({ group, groups, beneficiaries, onBack, onPersist }: GroupDetailProps) {
  const [memberSearch, setMemberSearch] = React.useState('')
  const [addMemberSearch, setAddMemberSearch] = React.useState('')
  const [showAddMember, setShowAddMember] = React.useState(false)

  const members = beneficiaries.filter((b) => group.beneficiaryIds.includes(b.id))
  const filteredMembers = members.filter(
    (b) =>
      b.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      b.location.toLowerCase().includes(memberSearch.toLowerCase())
  )

  const nonMembers = beneficiaries.filter((b) => !group.beneficiaryIds.includes(b.id))
  const filteredNonMembers = nonMembers.filter(
    (b) =>
      b.name.toLowerCase().includes(addMemberSearch.toLowerCase()) ||
      b.location.toLowerCase().includes(addMemberSearch.toLowerCase())
  )

  function handleAddMember(beneficiaryId: string) {
    onPersist(groups.map((g) =>
      g.id === group.id ? { ...g, beneficiaryIds: [...g.beneficiaryIds, beneficiaryId] } : g
    ))
  }

  function handleRemoveMember(beneficiaryId: string) {
    onPersist(groups.map((g) =>
      g.id === group.id ? { ...g, beneficiaryIds: g.beneficiaryIds.filter((id) => id !== beneficiaryId) } : g
    ))
  }

  return (
    <div className="flex-1 bg-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          All Groups
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Users size={28} className="text-orange-500" />
            </div>
            <div className="pt-1">
              <h1 className="text-2xl font-black text-[#1a1a1a] leading-tight">{group.name}</h1>
              {group.description && (
                <p className="text-sm text-gray-400 mt-1">{group.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                Created {group.createdAt} · {group.beneficiaryIds.length} member{group.beneficiaryIds.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowAddMember((v) => !v); setAddMemberSearch('') }}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#1a1a1a] hover:bg-[#333] text-white px-3 py-2 rounded-xl transition-colors"
          >
            <UserPlus size={13} />
            Add members
          </button>
        </div>
      </div>

      {/* Add member panel */}
      {showAddMember && (
        <div className="px-8 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#1a1a1a]">Add beneficiaries to group</p>
            <button
              onClick={() => setShowAddMember(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200"
            >
              <X size={14} />
            </button>
          </div>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search beneficiaries…"
              value={addMemberSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddMemberSearch(e.currentTarget.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {filteredNonMembers.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                    {b.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a]">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddMember(b.id)}
                  className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus size={11} />
                  Add
                </button>
              </div>
            ))}
            {filteredNonMembers.length === 0 && (
              <p className="text-xs text-center text-gray-400 py-4">
                {nonMembers.length === 0 ? 'All beneficiaries are already in this group' : 'No matching beneficiaries'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#1a1a1a]">Members</h3>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members…"
              value={memberSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMemberSearch(e.currentTarget.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent w-48"
            />
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Users size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {members.length === 0 ? 'No members yet' : 'No matching members'}
            </p>
            {members.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">Use "Add members" to add beneficiaries to this group</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0">
                  {b.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#1a1a1a]">{b.name}</p>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', STATUS_COLORS[b.status])}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{b.location}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{b.gender}</span>
                  <span>·</span>
                  <span>{b.age}y</span>
                </div>
                <button
                  onClick={() => handleRemoveMember(b.id)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-all"
                >
                  <UserMinus size={11} />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
