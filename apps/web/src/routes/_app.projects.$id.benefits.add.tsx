import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronRight, ChevronLeft, Plus, Trash2, Search, AlertCircle, Coins } from 'lucide-react'
import { cn } from '@rs/ui'
import { useProjectAllocations } from '@rahataid/projects-shared/project'
import { useBeneficiaries } from '@rahataid/projects-shared/beneficiary'
import { loadBenefits, loadTokens } from '@rahataid/projects-shared/benefits'
import type { Benefit, Token } from '@rahataid/projects-shared/benefits'
import { idbTokenService } from '@rahataid/sdk'
import type { TreasuryToken } from '@rahataid/sdk'

export const Route = createFileRoute('/_app/projects/$id/benefits/add')({
  validateSearch: (search: Record<string, unknown>) => ({
    benefitId: typeof search.benefitId === 'string' ? search.benefitId : undefined,
  }),
  component: AddBenefitAssignmentPage,
})

// ─── types ───────────────────────────────────────────────────────────────────

interface PackageItem {
  id: string
  name: string
  quantity: number
  tokenCostPerItem: number
}

interface Step1State {
  benefitId: string
  token: TreasuryToken | ''
  totalAmount: number | ''
}

interface Step2State {
  useUniform: boolean
  uniformAmount: number | ''
  selectedBeneficiaries: { id: string; amount: number | '' }[]
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function generateTokenCode(tokens: Token[]): string {
  const max = tokens.reduce((n, t) => {
    const num = parseInt(t.code.replace('TKN-', ''), 10)
    return isNaN(num) ? n : Math.max(n, num)
  }, 0)
  return `TKN-${String(max + 1).padStart(4, '0')}`
}

const STEP_LABELS = ['Distribution', 'Beneficiaries', 'Benefit Package']

// ─── component ───────────────────────────────────────────────────────────────

function AddBenefitAssignmentPage() {
  const { id: projectId } = Route.useParams()
  const { benefitId: initialBenefitId } = Route.useSearch()
  const navigate = useNavigate()

  const { data: allocations = [] } = useProjectAllocations(projectId)
  const { data: beneficiaries = [] } = useBeneficiaries(projectId)
  const [benefits, setBenefits] = React.useState<Benefit[]>([])
  const activeBenefits = benefits.filter((b) => b.isActive)

  React.useEffect(() => {
    loadBenefits(projectId).then(setBenefits).catch(() => setBenefits([]))
  }, [projectId])

  const [step, setStep] = React.useState(1)

  const [step1, setStep1] = React.useState<Step1State>({
    benefitId: initialBenefitId ?? '',
    token: '',
    totalAmount: '',
  })

  const [step2, setStep2] = React.useState<Step2State>({
    useUniform: true,
    uniformAmount: '',
    selectedBeneficiaries: [],
  })

  const [packageItems, setPackageItems] = React.useState<PackageItem[]>([])
  const [beneficiarySearch, setBeneficiarySearch] = React.useState('')

  // ── derived ────────────────────────────────────────────────────────────────

  const selectedBenefit: Benefit | undefined = benefits.find((b) => b.id === step1.benefitId)
  const isNonToken = selectedBenefit && selectedBenefit.type !== 'Cash'

  // Total steps: 2 for Cash, 3 for non-token
  const totalSteps = isNonToken ? 3 : 2

  // Per-token allocated amounts for this project
  const projectTokenTotals = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const a of allocations) {
      map.set(a.token, (map.get(a.token) ?? 0) + a.amount)
    }
    return map
  }, [allocations])

  // Step 1 validation
  const allocatedForToken = step1.token ? (projectTokenTotals.get(step1.token) ?? 0) : 0
  const totalAmountNum = typeof step1.totalAmount === 'number' ? step1.totalAmount : 0
  const step1Valid =
    !!step1.benefitId &&
    !!step1.token &&
    totalAmountNum > 0 &&
    totalAmountNum <= allocatedForToken

  // Step 2 validation
  const activeBeneficiaries = beneficiaries.filter((b) => b.status !== 'Inactive')
  const filteredBeneficiaries = activeBeneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
      b.location.toLowerCase().includes(beneficiarySearch.toLowerCase())
  )

  const step2AllocatedTotal = React.useMemo(() => {
    if (step2.useUniform) {
      const amt = typeof step2.uniformAmount === 'number' ? step2.uniformAmount : 0
      return amt * step2.selectedBeneficiaries.length
    }
    return step2.selectedBeneficiaries.reduce((sum, b) => {
      const amt = typeof b.amount === 'number' ? b.amount : 0
      return sum + amt
    }, 0)
  }, [step2])

  const step2Valid =
    step2.selectedBeneficiaries.length > 0 &&
    step2AllocatedTotal > 0 &&
    step2AllocatedTotal <= totalAmountNum

  // Step 3 package cost
  const packageTotalCost = packageItems.reduce(
    (sum, item) => sum + item.quantity * item.tokenCostPerItem,
    0
  )

  // ── step 2 helpers ─────────────────────────────────────────────────────────

  function toggleBeneficiary(id: string) {
    setStep2((prev) => {
      const exists = prev.selectedBeneficiaries.find((b) => b.id === id)
      if (exists) {
        return { ...prev, selectedBeneficiaries: prev.selectedBeneficiaries.filter((b) => b.id !== id) }
      }
      return {
        ...prev,
        selectedBeneficiaries: [...prev.selectedBeneficiaries, { id, amount: prev.useUniform ? prev.uniformAmount : '' }],
      }
    })
  }

  function setBeneficiaryAmount(id: string, amount: number | '') {
    setStep2((prev) => ({
      ...prev,
      selectedBeneficiaries: prev.selectedBeneficiaries.map((b) =>
        b.id === id ? { ...b, amount } : b
      ),
    }))
  }

  // ── step 3 helpers ─────────────────────────────────────────────────────────

  function addPackageItem() {
    setPackageItems((prev) => [...prev, { id: uid(), name: '', quantity: 1, tokenCostPerItem: 0 }])
  }

  function updatePackageItem(id: string, field: keyof Omit<PackageItem, 'id'>, value: string | number) {
    setPackageItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  function removePackageItem(id: string) {
    setPackageItems((prev) => prev.filter((item) => item.id !== id))
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!selectedBenefit) return

    const existingTokens = await loadTokens(projectId)
    let running = [...existingTokens]
    const today = new Date().toISOString().split('T')[0]!

    for (const sel of step2.selectedBeneficiaries) {
      const amount = step2.useUniform
        ? (typeof step2.uniformAmount === 'number' ? step2.uniformAmount : 0)
        : (typeof sel.amount === 'number' ? sel.amount : 0)

      const code = generateTokenCode(running)
      const token = await idbTokenService.create(projectId, {
        code,
        beneficiaryId: sel.id,
        benefitId: selectedBenefit.id,
        amount,
        status: 'Issued',
        issuedDate: today,
      })
      running = [...running, token]
    }

    navigate({
      to: '/projects/$id/benefits',
      params: { id: projectId },
      search: { benefit: selectedBenefit.id },
    })
  }

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-gray-100">
        <button
          onClick={() => navigate({ to: '/projects/$id/benefits', params: { id: projectId }, search: { benefit: undefined } })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Back to Benefits
        </button>
        <h1 className="text-2xl font-black text-[#1a1a1a]">Assign Benefit to Beneficiaries</h1>
        <p className="text-sm text-gray-400 mt-1">
          Follow the steps to distribute tokens to project beneficiaries.
        </p>
      </div>

      {/* Stepper */}
      <div className="px-8 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-0">
          {STEP_LABELS.slice(0, totalSteps).map((label, i) => {
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
                {i < totalSteps - 1 && (
                  <div className={cn('flex-1 h-px mx-3', step > stepNum ? 'bg-orange-300' : 'bg-gray-200')} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-8 py-6 max-w-2xl">

        {/* ── Step 1: Distribution Setup ── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Select benefit */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2">Select Benefit *</label>
              <div className="grid grid-cols-2 gap-2">
                {activeBenefits.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setStep1((s) => ({ ...s, benefitId: b.id, token: '' }))}
                    className={cn(
                      'text-left p-3 rounded-xl border text-xs transition-all',
                      step1.benefitId === b.id
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="font-semibold text-[#1a1a1a]">{b.name}</p>
                    <p className="text-gray-400 mt-0.5">{b.type} · {b.valuePerUnit} {b.unit}/token</p>
                  </button>
                ))}
                {activeBenefits.length === 0 && (
                  <p className="col-span-2 text-xs text-gray-400 py-4">
                    No active benefits. Create a benefit first from the Benefits page.
                  </p>
                )}
              </div>
            </div>

            {/* Select token */}
            {step1.benefitId && (
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Select Token *</label>
                {projectTokenTotals.size === 0 ? (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    No funds have been allocated to this project yet. Go to Fund Management to allocate funds first.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Array.from(projectTokenTotals.entries()).map(([token, allocated]) => (
                      <button
                        key={token}
                        onClick={() => setStep1((s) => ({ ...s, token: token as TreasuryToken }))}
                        className={cn(
                          'flex flex-col px-4 py-2.5 rounded-xl border text-xs transition-all',
                          step1.token === token
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <span className="font-bold text-[#1a1a1a]">{token}</span>
                        <span className="text-gray-400 mt-0.5">
                          {new Intl.NumberFormat('en-US').format(allocated)} allocated
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Total distribution amount */}
            {step1.token && (
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">
                  Total Amount to Distribute *
                  <span className="ml-1 font-normal text-gray-400">
                    (max: {new Intl.NumberFormat('en-US').format(allocatedForToken)} {step1.token})
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={allocatedForToken}
                    placeholder="0"
                    value={step1.totalAmount}
                    onChange={(e) => {
                      const v = e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)
                      setStep1((s) => ({ ...s, totalAmount: v }))
                    }}
                    className="w-48 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">{step1.token}</span>
                </div>
                {typeof step1.totalAmount === 'number' && step1.totalAmount > allocatedForToken && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
                    <AlertCircle size={12} />
                    Amount exceeds the allocated {step1.token} for this project.
                  </div>
                )}

                {/* Allocation progress bar */}
                {allocatedForToken > 0 && totalAmountNum > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          totalAmountNum > allocatedForToken ? 'bg-red-400' : 'bg-orange-400'
                        )}
                        style={{ width: `${Math.min((totalAmountNum / allocatedForToken) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Coins size={10} />
                      {new Intl.NumberFormat('en-US').format(totalAmountNum)} of{' '}
                      {new Intl.NumberFormat('en-US').format(allocatedForToken)} {step1.token} allocated to project
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Beneficiary Allocation ── */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Distributing</p>
                <p className="text-sm font-bold text-[#1a1a1a]">
                  {new Intl.NumberFormat('en-US').format(totalAmountNum)} {step1.token}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Assigned so far</p>
                <p className={cn('text-sm font-bold', step2AllocatedTotal > totalAmountNum ? 'text-red-500' : 'text-orange-500')}>
                  {new Intl.NumberFormat('en-US').format(step2AllocatedTotal)} {step1.token}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="text-sm font-bold text-gray-400">
                  {new Intl.NumberFormat('en-US').format(Math.max(0, totalAmountNum - step2AllocatedTotal))} {step1.token}
                </p>
              </div>
            </div>

            {/* Allocation mode */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep2((s) => ({ ...s, useUniform: true }))}
                className={cn(
                  'px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                  step2.useUniform
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                Uniform amount
              </button>
              <button
                onClick={() => setStep2((s) => ({ ...s, useUniform: false }))}
                className={cn(
                  'px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                  !step2.useUniform
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                )}
              >
                Individual amounts
              </button>
            </div>

            {/* Uniform amount input */}
            {step2.useUniform && (
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">
                  Amount per beneficiary *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={step2.uniformAmount}
                    onChange={(e) => {
                      const v = e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)
                      setStep2((s) => ({ ...s, uniformAmount: v }))
                    }}
                    className="w-40 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">{step1.token}</span>
                </div>
              </div>
            )}

            {/* Beneficiary search */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2">
                Select Beneficiaries *
                {step2.selectedBeneficiaries.length > 0 && (
                  <span className="ml-2 text-orange-500">{step2.selectedBeneficiaries.length} selected</span>
                )}
              </label>
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or location…"
                  value={beneficiarySearch}
                  onChange={(e) => setBeneficiarySearch(e.currentTarget.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto rounded-xl border border-gray-200 p-2">
                {filteredBeneficiaries.map((b) => {
                  const sel = step2.selectedBeneficiaries.find((s) => s.id === b.id)
                  const checked = !!sel
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
                        checked ? 'bg-orange-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBeneficiary(b.id)}
                        className="accent-orange-500"
                      />
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                        {b.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1a1a]">{b.name}</p>
                        <p className="text-xs text-gray-400 truncate">{b.location}</p>
                      </div>
                      {checked && !step2.useUniform && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            placeholder="amount"
                            value={sel?.amount ?? ''}
                            onChange={(e) => {
                              const v = e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)
                              setBeneficiaryAmount(b.id, v)
                            }}
                            className="w-24 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                          />
                          <span className="text-xs text-gray-400">{step1.token}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                {filteredBeneficiaries.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-4">No matching beneficiaries</p>
                )}
              </div>
            </div>

            {step2AllocatedTotal > totalAmountNum && (
              <div className="flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle size={12} />
                Total assigned ({new Intl.NumberFormat('en-US').format(step2AllocatedTotal)} {step1.token}) exceeds
                distribution amount ({new Intl.NumberFormat('en-US').format(totalAmountNum)} {step1.token}).
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Benefit Package Items (non-token only) ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[#1a1a1a] mb-1">Define Benefit Package Items</h2>
              <p className="text-xs text-gray-400 mb-4">
                List the physical items included in this benefit package and the token cost per item.
                The total package cost shows how much each token is worth in goods.
              </p>
            </div>

            {/* Items table */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                    <th className="text-left px-4 py-2.5">Item name</th>
                    <th className="text-left px-4 py-2.5 w-28">Quantity</th>
                    <th className="text-left px-4 py-2.5 w-40">Token cost / item</th>
                    <th className="text-left px-4 py-2.5 w-28">Subtotal</th>
                    <th className="px-2 py-2.5 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {packageItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="e.g. Rice bag"
                          value={item.name}
                          onChange={(e) => updatePackageItem(item.id, 'name', e.currentTarget.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updatePackageItem(item.id, 'quantity', Number(e.currentTarget.value))}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={item.tokenCostPerItem}
                            onChange={(e) => updatePackageItem(item.id, 'tokenCostPerItem', Number(e.currentTarget.value))}
                            className="w-24 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400"
                          />
                          <span className="text-xs text-gray-400">{step1.token}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs font-semibold text-[#1a1a1a]">
                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
                          item.quantity * item.tokenCostPerItem
                        )}{' '}
                        {step1.token}
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
              {packageItems.length === 0 && (
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

            {/* Total cost summary */}
            {packageItems.length > 0 && (
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Total benefit package cost</p>
                  <p className="text-lg font-black text-orange-600">
                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(packageTotalCost)}{' '}
                    {step1.token}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  per beneficiary · {step2.selectedBeneficiaries.length} beneficiar{step2.selectedBeneficiaries.length !== 1 ? 'ies' : 'y'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => {
              if (step === 1) navigate({ to: '/projects/$id/benefits', params: { id: projectId }, search: { benefit: undefined } })
              else setStep((s) => s - 1)
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <ChevronLeft size={14} />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < totalSteps ? (
            <button
              disabled={step === 1 ? !step1Valid : !step2Valid}
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => { void handleSubmit() }}
              disabled={!step2Valid}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Issue Tokens &amp; Save
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
