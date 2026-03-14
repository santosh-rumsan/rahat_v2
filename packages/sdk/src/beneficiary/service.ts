import type { Beneficiary, CreateBeneficiaryInput, UpdateBeneficiaryInput } from '../types/beneficiary.js'

export interface BeneficiaryService {
  list(projectId: string): Promise<Beneficiary[]>
  get(projectId: string, id: string): Promise<Beneficiary | undefined>
  create(projectId: string, data: CreateBeneficiaryInput): Promise<Beneficiary>
  update(projectId: string, id: string, data: UpdateBeneficiaryInput): Promise<Beneficiary>
  delete(projectId: string, id: string): Promise<void>
}
