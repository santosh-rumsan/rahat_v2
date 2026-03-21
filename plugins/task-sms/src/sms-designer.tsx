import * as React from 'react'
import { Textarea } from '@rs/ui/textarea'
import { Input } from '@rs/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@rs/ui/alert-dialog'
import { Search, Plus, X, Users } from 'lucide-react'
import { loadGroups } from '@rahataid/projects-shared/beneficiary'
import type { BeneficiaryGroup, Beneficiary } from '@rahataid/projects-shared/beneficiary'
import type { DesignerProps } from '@rahataid/projects-shared/task-management'

const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: '1', name: 'Gita Sharma', age: 34, gender: 'Female', location: 'Ward 5, Kathmandu', status: 'Verified', enrolledDate: '2026-02-10' },
  { id: '2', name: 'Raju Tamang', age: 45, gender: 'Male', location: 'Ward 2, Lalitpur', status: 'Pending', enrolledDate: '2026-02-12' },
  { id: '3', name: 'Sunita Rai', age: 28, gender: 'Female', location: 'Ward 8, Bhaktapur', status: 'Verified', enrolledDate: '2026-02-14' },
  { id: '4', name: 'Dipak Magar', age: 52, gender: 'Male', location: 'Ward 1, Kathmandu', status: 'Inactive', enrolledDate: '2026-02-15' },
  { id: '5', name: 'Kamala Thapa', age: 39, gender: 'Female', location: 'Ward 3, Lalitpur', status: 'Verified', enrolledDate: '2026-02-18' },
  { id: '6', name: 'Bikram Gurung', age: 31, gender: 'Male', location: 'Ward 6, Kathmandu', status: 'Pending', enrolledDate: '2026-02-20' },
  { id: '7', name: 'Saraswati Limbu', age: 44, gender: 'Female', location: 'Ward 9, Bhaktapur', status: 'Verified', enrolledDate: '2026-02-22' },
  { id: '8', name: 'Hari Prasad Oli', age: 58, gender: 'Male', location: 'Ward 4, Lalitpur', status: 'Inactive', enrolledDate: '2026-02-24' },
  { id: '9', name: 'Anita Shrestha', age: 26, gender: 'Female', location: 'Ward 7, Kathmandu', status: 'Verified', enrolledDate: '2026-02-26' },
  { id: '10', name: 'Narayan Bista', age: 37, gender: 'Male', location: 'Ward 11, Lalitpur', status: 'Pending', enrolledDate: '2026-02-28' },
  { id: '11', name: 'Puja Karki', age: 22, gender: 'Female', location: 'Ward 2, Bhaktapur', status: 'Verified', enrolledDate: '2026-03-01' },
  { id: '12', name: 'Mohan Khatri', age: 49, gender: 'Male', location: 'Ward 14, Kathmandu', status: 'Inactive', enrolledDate: '2026-03-03' },
]

interface SmsDesignerData {
  senderId: string
  messageTemplate: string
  selectedGroupIds: string[]
}

function getSmsData(designerData?: Record<string, unknown>): SmsDesignerData {
  return {
    senderId: (designerData?.senderId as string) ?? '',
    messageTemplate: (designerData?.messageTemplate as string) ?? '',
    selectedGroupIds: (designerData?.selectedGroupIds as string[]) ?? [],
  }
}

function getBeneficiariesForGroup(group: BeneficiaryGroup): Beneficiary[] {
  return MOCK_BENEFICIARIES.filter((b) => group.beneficiaryIds.includes(b.id))
}

function statusColor(status: string) {
  if (status === 'Verified') return 'bg-green-100 text-green-700'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-500'
}

export function SmsDesigner({ project, task, onUpdate }: DesignerProps) {
  const [data, setData] = React.useState<SmsDesignerData>(() => getSmsData(task.designerData))
  const [allGroups, setAllGroups] = React.useState<BeneficiaryGroup[]>([])
  const [search, setSearch] = React.useState('')
  const [showGroupPicker, setShowGroupPicker] = React.useState(false)
  const [groupPickerSearch, setGroupPickerSearch] = React.useState('')
  const [activePillGroupId, setActivePillGroupId] = React.useState<string | null>(null)
  const [groupToRemove, setGroupToRemove] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadGroups(project.id).then(setAllGroups).catch(() => {})
  }, [project.id])

  function update<K extends keyof SmsDesignerData>(key: K, value: SmsDesignerData[K]) {
    const next = { ...data, [key]: value }
    setData(next)
    onUpdate(next)
  }

  function addGroup(groupId: string) {
    if (data.selectedGroupIds.includes(groupId)) return
    const next = { ...data, selectedGroupIds: [...data.selectedGroupIds, groupId] }
    setData(next)
    onUpdate(next)
  }

  function removeGroup(groupId: string) {
    const next = { ...data, selectedGroupIds: data.selectedGroupIds.filter((id) => id !== groupId) }
    setData(next)
    onUpdate(next)
    if (activePillGroupId === groupId) setActivePillGroupId(null)
  }

  function handlePillClick(groupId: string) {
    setSearch('')
    setActivePillGroupId((prev) => (prev === groupId ? null : groupId))
  }

  function handleSearch(value: string) {
    setSearch(value)
    if (value) setActivePillGroupId(null)
  }

  const charCount = data.messageTemplate.length
  const smsCount = Math.ceil(charCount / 160) || 1

  const selectedGroups = allGroups.filter((g) => data.selectedGroupIds.includes(g.id))
  const availableGroups = allGroups.filter((g) => !data.selectedGroupIds.includes(g.id))
  const filteredAvailable = availableGroups.filter((g) =>
    g.name.toLowerCase().includes(groupPickerSearch.toLowerCase())
  )

  const allSelectedBeneficiaries = selectedGroups.flatMap((g) => getBeneficiariesForGroup(g))
  const uniqueBeneficiaries = Array.from(new Map(allSelectedBeneficiaries.map((b) => [b.id, b])).values())

  let displayedBeneficiaries = uniqueBeneficiaries
  if (activePillGroupId) {
    const activeGroup = allGroups.find((g) => g.id === activePillGroupId)
    displayedBeneficiaries = activeGroup ? getBeneficiariesForGroup(activeGroup) : []
  }
  if (search) {
    displayedBeneficiaries = displayedBeneficiaries.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  const activeGroupName = activePillGroupId ? allGroups.find((g) => g.id === activePillGroupId)?.name : null
  const groupToRemoveName = groupToRemove ? allGroups.find((g) => g.id === groupToRemove)?.name : null

  return (
    <>
      <AlertDialog open={!!groupToRemove} onOpenChange={(open) => { if (!open) setGroupToRemove(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Group</AlertDialogTitle>
            <AlertDialogDescription>
              Remove &quot;{groupToRemoveName}&quot; from this task? Beneficiaries in this group will no longer receive the SMS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (groupToRemove) { removeGroup(groupToRemove); setGroupToRemove(null) } }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex gap-6 h-full">
        {/* Left: SMS config + group pills */}
        <div className="flex-1 space-y-5 min-w-0 flex flex-col">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">SMS Message Designer</h3>
            <p className="text-xs text-slate-400 mb-4">Configure the SMS message that will be sent when this task is triggered.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sms-sender-id" className="text-sm font-medium text-slate-700">
              Sender ID
            </label>
            <Input
              id="sms-sender-id"
              value={data.senderId}
              onChange={(e) => update('senderId', e.target.value)}
              placeholder="e.g. RAHAT or +977XXXXXXXXXX"
              maxLength={11}
            />
            <p className="text-xs text-slate-400">Alphanumeric sender ID (max 11 characters) or phone number.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sms-message" className="text-sm font-medium text-slate-700">
              Message Template
            </label>
            <Textarea
              id="sms-message"
              value={data.messageTemplate}
              onChange={(e) => update('messageTemplate', e.target.value)}
              placeholder="Type your SMS message here. Use {{name}}, {{amount}}, {{date}} for dynamic values."
              rows={5}
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Use &#123;&#123;name&#125;&#125;, &#123;&#123;amount&#125;&#125;, &#123;&#123;date&#125;&#125; for dynamic values</span>
              <span>{charCount} chars · {smsCount} SMS</span>
            </div>
          </div>

          {/* Beneficiary Group pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Beneficiary Groups</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowGroupPicker((v) => !v); setGroupPickerSearch('') }}
                  className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus size={11} />
                  Add Group
                </button>

                {showGroupPicker && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-10">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search groups…"
                          value={groupPickerSearch}
                          onChange={(e) => setGroupPickerSearch(e.target.value)}
                          className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      {filteredAvailable.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">
                          {availableGroups.length === 0 ? 'All groups added' : 'No matching groups'}
                        </p>
                      ) : (
                        filteredAvailable.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => { addGroup(g.id); setShowGroupPicker(false) }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-orange-50 transition-colors"
                          >
                            <p className="font-medium text-slate-800">{g.name}</p>
                            <p className="text-slate-400">{g.beneficiaryIds.length} members</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedGroups.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No groups added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedGroups.map((group) => {
                  const isActive = activePillGroupId === group.id
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handlePillClick(group.id)}
                      className={[
                        'flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full border text-xs font-medium transition-all',
                        isActive
                          ? 'bg-orange-100 border-orange-300 text-orange-700'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300',
                      ].join(' ')}
                    >
                      {group.name}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); setGroupToRemove(group.id) }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), setGroupToRemove(group.id))}
                        className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-300 hover:bg-red-400 text-white transition-colors"
                      >
                        <X size={8} />
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Beneficiary list */}
        <div className="w-96 flex-shrink-0 border-l border-slate-100 pl-6 flex flex-col">
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={14} className="text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-700">Beneficiaries</h4>
            {uniqueBeneficiaries.length > 0 && (
              <span className="ml-auto text-xs text-slate-400">{uniqueBeneficiaries.length} unique</span>
            )}
          </div>

          {selectedGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl flex-1">
              <Users size={22} className="opacity-40" />
              <p className="text-xs text-center">Add groups on the left<br />to see beneficiaries.</p>
            </div>
          ) : (
            <>
              {activeGroupName && (
                <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                  <span className="text-[11px] text-orange-700 font-medium flex-1 truncate">
                    Filtered: {activeGroupName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePillGroupId(null)}
                    className="text-[10px] font-semibold text-orange-500 hover:text-orange-700 flex-shrink-0 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={activePillGroupId ? 'Search in group…' : 'Search all…'}
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-0.5">
                {displayedBeneficiaries.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No beneficiaries found</p>
                ) : (
                  displayedBeneficiaries.map((b) => (
                    <div key={b.id} className="px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-medium text-slate-700 truncate">{b.name}</p>
                        <span className={['text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0', statusColor(b.status)].join(' ')}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{b.location}</p>
                    </div>
                  ))
                )}
              </div>
              {displayedBeneficiaries.length > 0 && (
                <p className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 mt-1">
                  {displayedBeneficiaries.length} shown
                  {search && <span className="text-orange-500"> · &quot;{search}&quot;</span>}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
