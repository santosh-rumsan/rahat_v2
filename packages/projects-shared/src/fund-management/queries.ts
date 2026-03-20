import { useQuery } from '@tanstack/react-query'
import { createFundService, getSDKApiUrl, TREASURY_TOKENS } from '@rahataid/sdk'
import type { FundAllocation, AllocationLog, TreasuryToken } from '@rahataid/sdk'
import type { Benefit } from '../benefits/types.js'
import type { Token } from '../benefits/types.js'

function service() {
  return createFundService(getSDKApiUrl())
}

// ─── query keys ──────────────────────────────────────────────────────────────

export const projectFundKeys = {
  allocations: (projectId: string) => ['fund-allocations', 'by-project', projectId] as const,
  logs: (projectId: string) => ['allocation-logs', 'by-project', projectId] as const,
}

// ─── server queries ───────────────────────────────────────────────────────────

export function useProjectFundAllocations(projectId: string) {
  return useQuery<FundAllocation[]>({
    queryKey: projectFundKeys.allocations(projectId),
    queryFn: async () => {
      const all = await service().listAllocations()
      return all.filter((a) => a.projectId === projectId)
    },
    enabled: !!projectId,
  })
}

export function useProjectFundLogs(projectId: string) {
  return useQuery<AllocationLog[]>({
    queryKey: projectFundKeys.logs(projectId),
    queryFn: async () => {
      const all = await service().listLogs()
      return all.filter((l) => l.projectId === projectId)
    },
    enabled: !!projectId,
  })
}

// ─── helpers ──────────────────────────────────────────────────────────────────

export function isTreasuryToken(t: string): t is TreasuryToken {
  return (TREASURY_TOKENS as readonly string[]).includes(t)
}

/** Resolve which treasury token a benefit draws from (checks .token then .unit). */
export function benefitTreasuryToken(benefit: Benefit): TreasuryToken | null {
  if (benefit.token && isTreasuryToken(benefit.token)) return benefit.token
  if (isTreasuryToken(benefit.unit)) return benefit.unit
  return null
}

// ─── types ───────────────────────────────────────────────────────────────────

export interface ProjectTokenBalance {
  token: TreasuryToken
  received: number   // allocated from treasury (IDB/API)
  reserved: number   // issued tokens not yet redeemed
  disbursed: number  // redeemed tokens
  available: number  // received - reserved - disbursed
}

export type ActivityKind = 'received' | 'reserved' | 'disbursed' | 'voided'

export interface ProjectActivity {
  id: string
  kind: ActivityKind
  token: TreasuryToken | null
  amount: number
  date: string        // ISO or date string
  label: string
}

// ─── derived data helpers ─────────────────────────────────────────────────────

export function computeProjectFundData(
  allocations: FundAllocation[],
  logs: AllocationLog[],
  benefits: Benefit[],
  tokens: Token[],
  primaryToken?: string,
): {
  balances: ProjectTokenBalance[]
  serverActivities: ProjectActivity[]
} {
  // Received from treasury
  const received: Record<TreasuryToken, number> = { cUSD: 0, cEUR: 0, cNPR: 0 }
  for (const a of allocations) {
    if (isTreasuryToken(a.token)) received[a.token] += a.amount
  }

  const reserved: Record<TreasuryToken, number> = { cUSD: 0, cEUR: 0, cNPR: 0 }
  const disbursed: Record<TreasuryToken, number> = { cUSD: 0, cEUR: 0, cNPR: 0 }

  for (const tkn of tokens) {
    const benefit = benefits.find((b) => b.id === tkn.benefitId)
    if (!benefit) continue
    const tt = benefitTreasuryToken(benefit)
    if (!tt) continue
    if (tkn.status === 'Issued') reserved[tt] += tkn.amount
    else if (tkn.status === 'Redeemed') disbursed[tt] += tkn.amount
  }

  // Always include primary token; also include any token with activity
  const activeTokens = TREASURY_TOKENS.filter(
    (t) => received[t] > 0 || reserved[t] > 0 || disbursed[t] > 0 || (primaryToken && t === primaryToken),
  )

  const balances: ProjectTokenBalance[] = activeTokens.map((t) => ({
    token: t,
    received: received[t],
    reserved: reserved[t],
    disbursed: disbursed[t],
    available: received[t] - reserved[t] - disbursed[t],
  }))

  // Server activities from allocation logs
  const serverActivities: ProjectActivity[] = logs.map((l) => ({
    id: l.id,
    kind: 'received',
    token: isTreasuryToken(l.token) ? l.token : null,
    amount: l.amount,
    date: l.createdAt,
    label: l.label,
  }))

  return { balances, serverActivities }
}

export function deriveTokenActivities(
  benefits: Benefit[],
  tokens: Token[],
): ProjectActivity[] {
  const activities: ProjectActivity[] = []

  for (const tkn of tokens) {
    const benefit = benefits.find((b) => b.id === tkn.benefitId)
    const tt = benefit ? benefitTreasuryToken(benefit) : null
    const benefitName = benefit?.name ?? 'Unknown benefit'

    activities.push({
      id: `issue-${tkn.id}`,
      kind: 'reserved',
      token: tt,
      amount: tkn.amount,
      date: tkn.issuedDate,
      label: `Token ${tkn.code} issued — ${benefitName}`,
    })

    if (tkn.status === 'Redeemed' && tkn.redeemedDate) {
      activities.push({
        id: `redeem-${tkn.id}`,
        kind: 'disbursed',
        token: tt,
        amount: tkn.amount,
        date: tkn.redeemedDate,
        label: `Token ${tkn.code} redeemed — ${benefitName}`,
      })
    }

    if (tkn.status === 'Voided') {
      activities.push({
        id: `void-${tkn.id}`,
        kind: 'voided',
        token: tt,
        amount: tkn.amount,
        date: tkn.issuedDate,
        label: `Token ${tkn.code} voided — ${benefitName}`,
      })
    }
  }

  return activities
}
