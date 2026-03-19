import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Banknote, Package, Droplets, Box, Briefcase, Users, Plus, Ticket, Pencil, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@rs/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@rs/ui/dropdown-menu'
import { cn } from '@rs/ui'
import { loadBenefits, saveBenefits, loadTokens } from '@rahataid/projects-shared/benefits'
import type { Benefit, BenefitType } from '@rahataid/projects-shared/benefits'
import { useBeneficiaries } from '@rahataid/projects-shared/beneficiary'

export const Route = createFileRoute('/_app/projects/$id/benefits/$benefitId/')({ component: BenefitDetailPage })

const TYPE_META: Record<BenefitType, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  Cash:    { icon: <Banknote size={16} />,   color: 'text-green-600',  bg: 'bg-green-100',  label: 'Cash' },
  Food:    { icon: <Package size={16} />,    color: 'text-orange-500', bg: 'bg-orange-100', label: 'Food' },
  WASH:    { icon: <Droplets size={16} />,   color: 'text-blue-500',   bg: 'bg-blue-100',   label: 'WASH' },
  NFI:     { icon: <Box size={16} />,        color: 'text-purple-500', bg: 'bg-purple-100', label: 'NFI' },
  Service: { icon: <Briefcase size={16} />,  color: 'text-rose-500',   bg: 'bg-rose-100',   label: 'Service' },
}

const STATUS_STYLES: Record<string, string> = {
  Issued:   'bg-blue-100 text-blue-700',
  Redeemed: 'bg-green-100 text-green-700',
  Expired:  'bg-gray-100 text-gray-500',
  Voided:   'bg-red-100 text-red-600',
}

function BenefitDetailPage() {
  const { id: projectId, benefitId } = Route.useParams()
  const navigate = useNavigate()

  const [benefit, setBenefit] = React.useState<Benefit | undefined>(undefined)

  React.useEffect(() => {
    const benefits = loadBenefits(projectId)
    setBenefit(benefits.find((b) => b.id === benefitId))
  }, [projectId, benefitId])

  function handleDelete() {
    if (!confirm('Delete this benefit? This cannot be undone.')) return
    const benefits = loadBenefits(projectId)
    saveBenefits(projectId, benefits.filter((b) => b.id !== benefitId))
    navigate({ to: '/projects/$id/benefits', params: { id: projectId }, search: { benefit: undefined } })
  }

  const { data: allBeneficiaries = [] } = useBeneficiaries(projectId)

  const tokens = React.useMemo(() => {
    const all = loadTokens(projectId)
    return all.filter((t) => t.benefitId === benefitId)
  }, [projectId, benefitId])

  const assignedBeneficiaries = React.useMemo(() => {
    if (!benefit?.beneficiaryIds) return []
    return allBeneficiaries.filter((b) => benefit.beneficiaryIds!.includes(b.id))
  }, [benefit, allBeneficiaries])

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

  if (!benefit) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Benefit not found.
      </div>
    )
  }

  const meta = TYPE_META[benefit.type]

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-gray-100 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', meta.bg)}>
              <span className={meta.color}>{meta.icon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1a1a1a]">{benefit.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', meta.bg, meta.color)}>
                  {meta.label}
                </span>
                {benefit.isActive
                  ? <span className="text-xs text-green-600 font-medium">Active</span>
                  : <span className="text-xs text-gray-400 font-medium">Inactive</span>
                }
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
                Actions
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: '/projects/$id/benefits/$benefitId/edit', params: { id: projectId, benefitId } })}>
                <Pencil size={13} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/projects/$id/benefits/$benefitId/beneficiaries/add', params: { id: projectId, benefitId } })}>
                <Plus size={13} className="mr-2" />
                Add Beneficiaries
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash2 size={13} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="information" className="flex flex-col flex-1 min-h-0">
        <TabsList className="px-8 flex-shrink-0">
          <TabsTrigger value="information">Information</TabsTrigger>
          <TabsTrigger value="beneficiaries">
            Beneficiaries
          </TabsTrigger>
          <TabsTrigger value="distribution-log">Distribution Log</TabsTrigger>
        </TabsList>

        {/* ── Information tab ── */}
        <TabsContent value="information" className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-2xl space-y-6">
            {benefit.description && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700">{benefit.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Type</p>
                <div className="flex items-center gap-2">
                  <span className={meta.color}>{meta.icon}</span>
                  <span className="text-sm font-semibold text-[#1a1a1a]">{benefit.type}</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Unit</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{benefit.unit}</p>
              </div>
              {benefit.totalAmount !== undefined && (
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Total Amount</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {new Intl.NumberFormat('en-US').format(benefit.totalAmount)} {benefit.token ?? benefit.unit}
                  </p>
                </div>
              )}
              {maxBeneficiaries !== null && (
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <p className="text-xs text-gray-400 mb-1">Max Beneficiaries</p>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    {maxBeneficiaries.toLocaleString()}
                  </p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Created</p>
                <p className="text-sm font-semibold text-[#1a1a1a]">{benefit.createdAt}</p>
              </div>
            </div>

            {/* Package items */}
            {benefit.packageItems && benefit.packageItems.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-3">Package Items</p>
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                        <th className="text-left px-4 py-2.5">Item</th>
                        <th className="text-left px-4 py-2.5 w-24">Quantity</th>
                        <th className="text-left px-4 py-2.5 w-32">Cost / item</th>
                        <th className="text-left px-4 py-2.5 w-28">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {benefit.packageItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2.5 text-sm text-[#1a1a1a] font-medium">{item.name}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-600">
                            {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(item.costPerItem)}{' '}
                            {benefit.token ?? benefit.unit}
                          </td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-[#1a1a1a]">
                            {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(item.quantity * item.costPerItem)}{' '}
                            {benefit.token ?? benefit.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex justify-end">
                  <p className="text-xs text-gray-500">
                    Package total:{' '}
                    <span className="font-bold text-[#1a1a1a]">
                      {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
                        benefit.packageItems.reduce((s, i) => s + i.quantity * i.costPerItem, 0)
                      )}{' '}
                      {benefit.token ?? benefit.unit}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Beneficiaries tab ── */}
        <TabsContent value="beneficiaries" className="flex-1 overflow-y-auto px-8 py-6">
          <div>
            {maxBeneficiaries !== null && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-[#1a1a1a]">{assignedBeneficiaries.length}</span>
                  {' / '}
                  <span className="font-semibold text-[#1a1a1a]">{maxBeneficiaries}</span>
                  {' beneficiaries assigned'}
                </p>
                {assignedBeneficiaries.length >= maxBeneficiaries && (
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                    Limit reached
                  </span>
                )}
              </div>
            )}

            {assignedBeneficiaries.length > 0 && (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Location</th>
                      <th className="text-left px-4 py-3 w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {assignedBeneficiaries.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                              {b.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-[#1a1a1a]">{b.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{b.location}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded-full',
                            b.status === 'Verified' ? 'bg-green-100 text-green-700' :
                            b.status === 'Pending'  ? 'bg-yellow-100 text-yellow-700' :
                                                      'bg-gray-100 text-gray-500'
                          )}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {assignedBeneficiaries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Users size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-1">No beneficiaries yet</p>
                <p className="text-xs text-gray-400">Click "Add Beneficiaries" to assign people to this benefit.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Distribution Log tab ── */}
        <TabsContent value="distribution-log" className="flex-1 overflow-y-auto px-8 py-6">
          <div>
            {tokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Ticket size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-1">No tokens issued</p>
                <p className="text-xs text-gray-400">Tokens will appear here once distribution begins.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 font-semibold">
                      <th className="text-left px-4 py-3">Token</th>
                      <th className="text-left px-4 py-3">Beneficiary</th>
                      <th className="text-left px-4 py-3 w-28">Amount</th>
                      <th className="text-left px-4 py-3 w-28">Status</th>
                      <th className="text-left px-4 py-3 w-28">Issued</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tokens.map((token) => {
                      const beneficiary = allBeneficiaries.find((b) => b.id === token.beneficiaryId)
                      return (
                        <tr key={token.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a1a1a]">{token.code}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{beneficiary?.name ?? token.beneficiaryId}</td>
                          <td className="px-4 py-3 text-sm font-medium text-[#1a1a1a]">
                            {new Intl.NumberFormat('en-US').format(token.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_STYLES[token.status] ?? 'bg-gray-100 text-gray-500')}>
                              {token.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{token.issuedDate}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
