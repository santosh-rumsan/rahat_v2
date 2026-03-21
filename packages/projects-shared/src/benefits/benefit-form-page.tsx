import * as React from 'react'
import { ChevronLeft, ChevronRight, Banknote, Plus, Trash2 } from 'lucide-react'
import { cn } from '@rs/ui'
import { idbBenefitService } from '@rahataid/sdk'
import type { Benefit, BenefitType, PackageItem } from './types.js'
import type { BenefitTypeDefinition } from './benefit-types/registry.js'
import { getRegisteredBenefitTypes } from './benefit-types/registry.js'

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ─── types ────────────────────────────────────────────────────────────────────

interface Step1Form {
  name: string
  type: BenefitType
  description: string
}

interface Step2Form {
  totalAmount: number | ''
  amountPerBeneficiary: number | ''
  token: string
  packageItems: PackageItem[]
}

export interface BenefitFormPageProps {
  projectId: string
  primaryToken: string
  availableTokens?: string[]
  availableBenefitTypes?: BenefitTypeDefinition[]
  benefitId?: string
  onDone: (benefitId: string) => void
  onCancel: () => void
}

const STEP_LABELS = ['Basic Info', 'Distribution']

// ─── component ───────────────────────────────────────────────────────────────

const DEFAULT_TOKENS = ['cUSD', 'cEUR', 'cNPR']

export function BenefitFormPage({ projectId, primaryToken, availableTokens = DEFAULT_TOKENS, availableBenefitTypes, benefitId, onDone, onCancel }: BenefitFormPageProps) {
  const isEdit = !!benefitId
  const [existing, setExisting] = React.useState<Benefit | undefined>(undefined)

  const benefitTypes = availableBenefitTypes ?? getRegisteredBenefitTypes()
  const defaultType = (benefitTypes[0]?.type ?? 'Cash') as BenefitType

  const [step, setStep] = React.useState(1)
  const [step1, setStep1] = React.useState<Step1Form>({ name: '', type: defaultType, description: '' })
  const [step2, setStep2] = React.useState<Step2Form>({ totalAmount: '', amountPerBeneficiary: '', token: primaryToken, packageItems: [] })

  React.useEffect(() => {
    if (benefitId) {
      idbBenefitService.get(projectId, benefitId).then((b) => {
        setExisting(b)
        if (b) {
          setStep1({ name: b.name, type: b.type, description: b.description ?? '' })
          setStep2({ totalAmount: b.totalAmount ?? '', amountPerBeneficiary: b.amountPerBeneficiary ?? '', token: b.token ?? primaryToken, packageItems: b.packageItems ?? [] })
        }
      }).catch(() => {})
    }
  }, [projectId, benefitId, primaryToken])

  // ── derived ────────────────────────────────────────────────────────────────

  const isNonCash = step1.type !== 'Cash'

  const packageTotalCost = step2.packageItems.reduce(
    (sum, item) => sum + item.quantity * item.costPerItem,
    0
  )

  const totalAmountNum = typeof step2.totalAmount === 'number' ? step2.totalAmount : 0
  const amountPerBeneficiaryNum = typeof step2.amountPerBeneficiary === 'number' ? step2.amountPerBeneficiary : 0

  const beneficiariesCovered = (() => {
    if (!isNonCash && amountPerBeneficiaryNum > 0 && totalAmountNum > 0)
      return Math.floor(totalAmountNum / amountPerBeneficiaryNum)
    if (isNonCash && packageTotalCost > 0 && totalAmountNum > 0)
      return Math.floor(totalAmountNum / packageTotalCost)
    return null
  })()

  const step1Valid = step1.name.trim().length > 0

  const step2Valid =
    totalAmountNum > 0 &&
    (!isNonCash ? amountPerBeneficiaryNum > 0 : step2.packageItems.every((item) => item.name.trim()))

  // ── package item helpers ────────────────────────────────────────────────────

  function addPackageItem() {
    setStep2((prev) => ({
      ...prev,
      packageItems: [...prev.packageItems, { id: uid(), name: '', quantity: 1, costPerItem: 0 }],
    }))
  }

  function updatePackageItem(id: string, field: keyof Omit<PackageItem, 'id'>, value: string | number) {
    setStep2((prev) => ({
      ...prev,
      packageItems: prev.packageItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }

  function removePackageItem(id: string) {
    setStep2((prev) => ({
      ...prev,
      packageItems: prev.packageItems.filter((item) => item.id !== id),
    }))
  }

  // ── save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!step2Valid) return

    if (isEdit && existing) {
      await idbBenefitService.update(projectId, existing.id, {
        name: step1.name.trim(),
        type: step1.type,
        description: step1.description.trim() || undefined,
        totalAmount: totalAmountNum,
        token: !isNonCash ? step2.token : primaryToken,
        amountPerBeneficiary: !isNonCash ? amountPerBeneficiaryNum : undefined,
        packageItems: isNonCash ? step2.packageItems : undefined,
      })
      onDone(existing.id)
    } else {
      const newBenefit = await idbBenefitService.create(projectId, {
        name: step1.name.trim(),
        type: step1.type,
        description: step1.description.trim() || undefined,
        unit: isNonCash ? 'Package' : step2.token,
        valuePerUnit: isNonCash ? packageTotalCost : amountPerBeneficiaryNum,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]!,
        totalAmount: totalAmountNum,
        token: !isNonCash ? step2.token : primaryToken,
        amountPerBeneficiary: !isNonCash ? amountPerBeneficiaryNum : undefined,
        packageItems: isNonCash ? step2.packageItems : undefined,
        beneficiaryIds: [],
      })
      onDone(newBenefit.id)
    }
  }

  const selectedMeta = benefitTypes.find((d) => d.type === step1.type) ?? benefitTypes[0]

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Back to Benefits
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">
          {isEdit ? 'Edit Benefit' : 'New Benefit'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isEdit ? 'Update the benefit details below.' : 'Define a new benefit to assign to project beneficiaries.'}
        </p>
      </div>

      {/* Stepper */}
      <div className="px-8 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-0">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1
            const isActive = step === stepNum
            const isDone = step > stepNum
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      isActive ? 'bg-brand-500 text-white' : isDone ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {stepNum}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      isActive ? 'text-brand-700' : isDone ? 'text-orange-500' : 'text-gray-400'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={cn('flex-1 h-px mx-3', step > stepNum ? 'bg-orange-300' : 'bg-gray-200')} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-8 py-6 max-w-2xl">

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Name *</label>
              <input
                type="text"
                placeholder="e.g. Monthly Cash Transfer"
                value={step1.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const v = e.currentTarget.value; setStep1((s) => ({ ...s, name: v })) }}
                autoFocus
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Type *</label>
              {isEdit ? (
                <div className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border border-gray-200 bg-gray-50', selectedMeta?.bg)}>
                  {selectedMeta?.IconComponent && <selectedMeta.IconComponent size={18} className={selectedMeta.color} />}
                  <span className={cn('font-medium', selectedMeta?.color)}>{step1.type}</span>
                  <span className="text-gray-400 text-xs ml-auto">Cannot be changed after creation</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-5 gap-2">
                    {benefitTypes.map((def) => {
                      const active = step1.type === def.type
                      return (
                        <button
                          key={def.type}
                          type="button"
                          onClick={() => setStep1((s) => ({ ...s, type: def.type as BenefitType }))}
                          className={cn(
                            'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
                            active
                              ? 'border-orange-400 bg-orange-50 text-orange-600'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          )}
                        >
                          {def.IconComponent && <def.IconComponent size={18} className={active ? 'text-orange-500' : def.color} />}
                          {def.label}
                        </button>
                      )
                    })}
                  </div>
                  {selectedMeta && (
                    <div className={cn('mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-sm', selectedMeta.bg)}>
                      {selectedMeta.IconComponent && <selectedMeta.IconComponent size={18} className={selectedMeta.color} />}
                      <span className={cn('font-medium', selectedMeta.color)}>{selectedMeta.label}</span>
                      <span className="text-gray-500 text-xs ml-auto">Selected</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Description</label>
              <textarea
                placeholder="Optional description of this benefit…"
                value={step1.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => { const v = e.currentTarget.value; setStep1((s) => ({ ...s, description: v })) }}
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Distribution ── */}
        {step === 2 && (
          <div className="space-y-6">

            {isNonCash && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-700">
                <Banknote size={13} className="flex-shrink-0" />
                <span>Non-cash benefits are distributed from the <strong>{primaryToken}</strong> (primary token) balance.</span>
              </div>
            )}

            {!isNonCash && (
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Token *</label>
                <div className="flex gap-2">
                  {availableTokens.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setStep2((s) => ({ ...s, token: t }))}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-xl border transition-all',
                        step2.token === t
                          ? 'border-orange-400 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Total Amount to Distribute *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  placeholder="0"
                  value={step2.totalAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const v = e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)
                    setStep2((s) => ({ ...s, totalAmount: v }))
                  }}
                  autoFocus
                  className="w-48 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <span className="text-sm font-medium text-gray-600">{!isNonCash ? step2.token : primaryToken}</span>
              </div>
            </div>

            {!isNonCash && (
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                  Amount per Beneficiary *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={step2.amountPerBeneficiary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)
                      setStep2((s) => ({ ...s, amountPerBeneficiary: v }))
                    }}
                    className="w-48 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <span className="text-sm font-medium text-gray-600">{step2.token}</span>
                </div>
              </div>
            )}

            {!isNonCash && beneficiariesCovered !== null && (
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Beneficiaries covered</p>
                  <p className="text-sm font-bold text-[#1a1a1a]">{beneficiariesCovered.toLocaleString()}</p>
                </div>
              </div>
            )}

            {isNonCash && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-0.5">Package Items</label>
                  <p className="text-xs text-gray-400 mb-3">
                    Define the items in each beneficiary package and the cost per item in {primaryToken}.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                        <th className="text-left px-4 py-2.5">Item name</th>
                        <th className="text-left px-4 py-2.5 w-28">Quantity</th>
                        <th className="text-left px-4 py-2.5 w-44">Cost / item ({primaryToken})</th>
                        <th className="text-left px-4 py-2.5 w-28">Subtotal</th>
                        <th className="px-2 py-2.5 w-8" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {step2.packageItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              placeholder="e.g. Rice bag"
                              value={item.name}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePackageItem(item.id, 'name', e.currentTarget.value)}
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePackageItem(item.id, 'quantity', Number(e.currentTarget.value))}
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.costPerItem}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePackageItem(item.id, 'costPerItem', Number(e.currentTarget.value))}
                              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </td>
                          <td className="px-4 py-2 text-xs font-semibold text-[#1a1a1a]">
                            {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
                              item.quantity * item.costPerItem
                            )}{' '}
                            {primaryToken}
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => removePackageItem(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {step2.packageItems.length === 0 && (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No items added. Click "Add Item" to define the benefit package.
                    </div>
                  )}
                </div>

                <button
                  onClick={addPackageItem}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#1a1a1a] border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-xl transition-all"
                >
                  <Plus size={12} />
                  Add Item
                </button>

                {step2.packageItems.length > 0 && (
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#1a1a1a]">Total package cost</p>
                      <p className="text-base font-black text-orange-600">
                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(packageTotalCost)}{' '}
                        {primaryToken}
                      </p>
                    </div>
                    {beneficiariesCovered !== null && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">Beneficiaries covered</p>
                        <p className="text-sm font-bold text-[#1a1a1a]">
                          {beneficiariesCovered.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => {
              if (step === 1) onCancel()
              else setStep((s) => s - 1)
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ChevronLeft size={14} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 2 ? (
            <button
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => { void handleSave() }}
              disabled={!step2Valid}
              className="px-5 py-2 text-sm font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isEdit ? 'Save changes' : 'Create Benefit'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
