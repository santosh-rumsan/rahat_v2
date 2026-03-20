import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Search } from 'lucide-react'
import { cn } from '@rs/ui'
import { loadBenefits } from '@rahataid/projects-shared/benefits'
import type { Benefit } from '@rahataid/projects-shared/benefits'
import { useBeneficiaries } from '@rahataid/projects-shared/beneficiary'
import { idbBenefitService } from '@rahataid/sdk'

export const Route = createFileRoute('/_app/projects/$id/benefits/$benefitId/beneficiaries/add')({ component: AddBeneficiariesToBenefitPage })

function AddBeneficiariesToBenefitPage() {
  const { id: projectId, benefitId } = Route.useParams()
  const navigate = useNavigate()

  const { data: allBeneficiaries = [] } = useBeneficiaries(projectId)
  const [search, setSearch] = React.useState('')
  const [benefit, setBenefit] = React.useState<Benefit | undefined>(undefined)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    loadBenefits(projectId)
      .then((benefits) => {
        const matched = benefits.find((b) => b.id === benefitId)
        setBenefit(matched)
        setSelected(new Set(matched?.beneficiaryIds ?? []))
      })
      .catch(() => {
        setBenefit(undefined)
        setSelected(new Set())
      })
  }, [projectId, benefitId])

  const maxBeneficiaries = React.useMemo(() => {
    if (!benefit?.totalAmount) return null
    if (benefit.amountPerBeneficiary && benefit.amountPerBeneficiary > 0) {
      return Math.floor(benefit.totalAmount / benefit.amountPerBeneficiary)
    }
    if (benefit.packageItems && benefit.packageItems.length > 0) {
      const packageCost = benefit.packageItems.reduce((s, i) => s + i.quantity * i.costPerItem, 0)
      if (packageCost > 0) return Math.floor(benefit.totalAmount / packageCost)
    }
    return null
  }, [benefit])

  const activeBeneficiaries = allBeneficiaries.filter((b) => b.status !== 'Inactive')
  const filtered = activeBeneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (maxBeneficiaries !== null && next.size >= maxBeneficiaries) return prev
        next.add(id)
      }
      return next
    })
  }

  async function handleSave() {
    if (!benefit) return
    await idbBenefitService.update(projectId, benefitId, {
      beneficiaryIds: Array.from(selected),
    })
    navigate({ to: '/projects/$id/benefits/$benefitId', params: { id: projectId, benefitId } })
  }

  const goBack = () => navigate({ to: '/projects/$id/benefits/$benefitId', params: { id: projectId, benefitId } })

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Back to Benefit
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">Add Beneficiaries</h1>
        <p className="text-sm text-gray-400 mt-1">
          {maxBeneficiaries !== null
            ? `Select up to ${maxBeneficiaries.toLocaleString()} beneficiaries for this benefit.`
            : 'Select beneficiaries to assign to this benefit.'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-500">
            {selected.size}{maxBeneficiaries !== null ? ` / ${maxBeneficiaries}` : ''} beneficiar{selected.size !== 1 ? 'ies' : 'y'} selected
          </p>
          {selected.size > 0 && (
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or location…"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="w-full pl-8 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* List */}
        <div className="space-y-1.5">
          {filtered.map((b) => {
            const checked = selected.has(b.id)
            const atLimit = maxBeneficiaries !== null && selected.size >= maxBeneficiaries && !checked
            return (
              <button
                key={b.id}
                onClick={() => toggle(b.id)}
                disabled={atLimit}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                  checked ? 'border-orange-400 bg-orange-50' :
                  atLimit ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' :
                  'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(b.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="accent-orange-500 flex-shrink-0"
                />
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                  {b.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a]">{b.name}</p>
                  <p className="text-xs text-gray-400 truncate">{b.location}</p>
                </div>
                <span className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0',
                  b.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                )}>
                  {b.status}
                </span>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-center text-gray-400 py-8">No matching beneficiaries</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={goBack}
            className="px-5 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { void handleSave() }}
            className="px-5 py-2.5 text-sm font-semibold bg-[#1a1a1a] text-white rounded-xl hover:bg-[#333] transition-colors"
          >
            Save ({selected.size})
          </button>
        </div>
      </div>
    </div>
  )
}
