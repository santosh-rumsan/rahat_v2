import type {
  Fund,
  CreateFundInput,
  UpdateFundInput,
  FundAllocation,
  CreateFundAllocationInput,
  AllocationLog,
} from '../types/fund.js'

export interface FundService {
  // Treasury deposits
  listFunds(): Promise<Fund[]>
  getFund(id: string): Promise<Fund | undefined>
  createFund(data: CreateFundInput): Promise<Fund>
  updateFund(id: string, data: UpdateFundInput): Promise<Fund>
  deleteFund(id: string): Promise<void>

  // Project allocations
  listAllocations(): Promise<FundAllocation[]>
  getAllocation(id: string): Promise<FundAllocation | undefined>
  createAllocation(data: CreateFundAllocationInput): Promise<FundAllocation>
  deleteAllocation(id: string): Promise<void>

  // Audit log (read-only)
  listLogs(): Promise<AllocationLog[]>
}
