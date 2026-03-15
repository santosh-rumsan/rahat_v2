export type TreasuryToken = 'cUSD' | 'cEUR' | 'cNPR'

export const TREASURY_TOKENS: TreasuryToken[] = ['cUSD', 'cEUR', 'cNPR']

// A deposit / source of funds into the treasury
export interface Fund {
  id: string
  name: string
  source: string
  amount: number
  token: TreasuryToken
  date: string
  notes?: string
}

export type CreateFundInput = Omit<Fund, 'id'>
export type UpdateFundInput = Partial<Omit<Fund, 'id'>>

// An allocation of treasury funds to a specific project
export interface FundAllocation {
  id: string
  projectId: string
  amount: number
  token: TreasuryToken
  allocatedAt: string
  notes?: string
}

export type CreateFundAllocationInput = Omit<FundAllocation, 'id' | 'allocatedAt'>

// Immutable audit log of all treasury activity
export interface AllocationLog {
  id: string
  type: 'deposit' | 'allocation'
  refId: string      // Fund.id or FundAllocation.id
  projectId?: string
  amount: number
  token: TreasuryToken
  label: string
  createdAt: string
}
