import type { BeneficiaryGroup } from '../types/beneficiary.js'

export type CreateBeneficiaryGroupInput = Omit<BeneficiaryGroup, 'id'>
export type UpdateBeneficiaryGroupInput = Partial<Omit<BeneficiaryGroup, 'id'>>

export interface BeneficiaryGroupService {
  list(projectId: string): Promise<BeneficiaryGroup[]>
  get(projectId: string, id: string): Promise<BeneficiaryGroup | undefined>
  create(projectId: string, data: CreateBeneficiaryGroupInput): Promise<BeneficiaryGroup>
  update(projectId: string, id: string, data: UpdateBeneficiaryGroupInput): Promise<BeneficiaryGroup>
  delete(projectId: string, id: string): Promise<void>
}
