import * as React from 'react'
import { PackageOpen, ArrowLeft, RefreshCw, Search, Users, Banknote, Package, Droplets, Box, Briefcase } from 'lucide-react'
import { Button } from '@rs/ui/button'
import { loadBenefits } from '@rahataid/projects-shared/benefits'
import type { Benefit, BenefitType } from '@rahataid/projects-shared/benefits'
import type { Beneficiary } from '@rahataid/projects-shared/beneficiary'
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

const TYPE_META: Record<BenefitType, { icon: React.ReactNode; color: string; bg: string }> = {
  Cash:    { icon: <Banknote size={16} />,   color: 'text-green-600',  bg: 'bg-green-100' },
  Food:    { icon: <Package size={16} />,    color: 'text-orange-500', bg: 'bg-orange-100' },
  WASH:    { icon: <Droplets size={16} />,   color: 'text-blue-500',   bg: 'bg-blue-100' },
  NFI:     { icon: <Box size={16} />,        color: 'text-purple-500', bg: 'bg-purple-100' },
  Service: { icon: <Briefcase size={16} />,  color: 'text-rose-500',   bg: 'bg-rose-100' },
}

interface BenefitDistributionData {
  benefitId: string
}

function getBenefitDistributionData(designerData?: Record<string, unknown>): BenefitDistributionData {
  return {
    benefitId: (designerData?.benefitId as string) ?? '',
  }
}

function statusColor(status: string) {
  if (status === 'Verified') return 'bg-green-100 text-green-700'
  if (status === 'Pending') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-500'
}

export function BenefitDistributionDesigner({ project, task, onUpdate }: DesignerProps) {
  const [data, setData] = React.useState<BenefitDistributionData>(() =>
    getBenefitDistributionData(task.designerData)
  )
  const [benefits, setBenefits] = React.useState<Benefit[]>([])
  const [showPicker, setShowPicker] = React.useState(false)
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    loadBenefits(project.id).then(setBenefits).catch(() => {})
  }, [project.id])

  function handleSelect(benefitId: string) {
    const next = { benefitId }
    setData(next)
    onUpdate(next)
    setShowPicker(false)
  }

  const activeBenefits = benefits.filter((b) => b.isActive)
  const selectedBenefit = benefits.find((b) => b.id === data.benefitId)

  const beneficiaries = selectedBenefit?.beneficiaryIds
    ? MOCK_BENEFICIARIES.filter((b) => selectedBenefit.beneficiaryIds!.includes(b.id))
    : MOCK_BENEFICIARIES.slice(0, 5)

  const filteredBeneficiaries = beneficiaries.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  )

  // Benefit picker screen
  if (showPicker) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Choose a Benefit</h3>
            <p className="text-xs text-slate-400">Select the benefit to distribute when this task is triggered.</p>
          </div>
        </div>

        {activeBenefits.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <PackageOpen size={28} className="opacity-40" />
            <p className="text-sm">No active benefits found for this project.</p>
            <p className="text-xs">Add benefits first from the Benefits section.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeBenefits.map((benefit) => {
              const isSelected = data.benefitId === benefit.id
              const meta = TYPE_META[benefit.type]
              return (
                <button
                  key={benefit.id}
                  type="button"
                  onClick={() => handleSelect(benefit.id)}
                  className={[
                    'w-full text-left p-4 rounded-xl border transition-all',
                    isSelected
                      ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-300'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={['w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', meta.bg].join(' ')}>
                        <span className={meta.color}>{meta.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{benefit.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {benefit.type} · {benefit.valuePerUnit} {benefit.unit} per unit
                        </p>
                        {benefit.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{benefit.description}</p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Main view
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">Benefit Selection</h3>
        <p className="text-xs text-slate-400">Select the benefit that will be distributed when this task is triggered.</p>
      </div>

      {selectedBenefit ? (
        <div className="flex gap-6 h-full">
          {/* Left: Benefit detail card */}
          <div className="flex-1 min-w-0 space-y-4">
            {(() => {
              const meta = TYPE_META[selectedBenefit.type]
              return (
                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', meta.bg].join(' ')}>
                      <span className={meta.color}>{meta.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold text-slate-800">{selectedBenefit.name}</p>
                        <span className={['text-[10px] px-2 py-0.5 rounded-full font-semibold', meta.bg, meta.color].join(' ')}>
                          {selectedBenefit.type}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      </div>
                      {selectedBenefit.description && (
                        <p className="text-xs text-slate-500 mt-1">{selectedBenefit.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-emerald-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Value per unit</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {selectedBenefit.valuePerUnit} <span className="font-normal text-slate-500">{selectedBenefit.unit}</span>
                      </p>
                    </div>
                    {selectedBenefit.amountPerBeneficiary != null && (
                      <div className="bg-white rounded-lg p-3 border border-emerald-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Per beneficiary</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">
                          {selectedBenefit.amountPerBeneficiary} <span className="font-normal text-slate-500">{selectedBenefit.unit}</span>
                        </p>
                      </div>
                    )}
                    {selectedBenefit.totalAmount != null && (
                      <div className="bg-white rounded-lg p-3 border border-emerald-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Total amount</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">
                          {selectedBenefit.totalAmount} <span className="font-normal text-slate-500">{selectedBenefit.unit}</span>
                        </p>
                      </div>
                    )}
                    {selectedBenefit.token && (
                      <div className="bg-white rounded-lg p-3 border border-emerald-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Token</p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5 font-mono">{selectedBenefit.token}</p>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-3 border border-emerald-100">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Created</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedBenefit.createdAt}</p>
                    </div>
                  </div>

                  {selectedBenefit.packageItems && selectedBenefit.packageItems.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Package items</p>
                      <div className="space-y-1">
                        {selectedBenefit.packageItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-emerald-100 text-xs">
                            <span className="font-medium text-slate-700">{item.name}</span>
                            <span className="text-slate-400">{item.quantity} × {item.costPerItem}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 h-9 px-4 text-sm font-semibold text-slate-600 rounded-xl"
              onClick={() => setShowPicker(true)}
            >
              <RefreshCw size={13} />
              Change Benefit
            </Button>
          </div>

          {/* Right: Beneficiary list */}
          <div className="w-64 flex-shrink-0 border-l border-slate-100 pl-6 flex flex-col">
            <div className="flex items-center gap-1.5 mb-3">
              <Users size={14} className="text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-700">Beneficiaries</h4>
              <span className="text-xs text-slate-400 ml-auto">{beneficiaries.length}</span>
            </div>

            <div className="relative mb-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search beneficiaries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-0.5">
              {filteredBeneficiaries.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No beneficiaries found</p>
              ) : (
                filteredBeneficiaries.map((b) => (
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

            {filteredBeneficiaries.length > 0 && (
              <p className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 mt-1">
                {filteredBeneficiaries.length} beneficiar{filteredBeneficiaries.length !== 1 ? 'ies' : 'y'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-16 border border-dashed border-slate-200 rounded-xl">
          <PackageOpen size={32} className="text-slate-300" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">No benefit selected</p>
            <p className="text-xs text-slate-400 mt-0.5">Choose a benefit to distribute with this task</p>
          </div>
          <Button
            type="button"
            className="bg-orange-500 hover:bg-orange-600 text-white h-9 px-5 text-sm font-semibold rounded-xl"
            onClick={() => setShowPicker(true)}
          >
            Add Benefit
          </Button>
        </div>
      )}
    </div>
  )
}
