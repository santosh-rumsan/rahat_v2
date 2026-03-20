import type { Benefit, CreateBenefitInput, UpdateBenefitInput } from '../types/benefit.js'

export interface BenefitService {
  list(projectId: string): Promise<Benefit[]>
  get(projectId: string, id: string): Promise<Benefit | undefined>
  create(projectId: string, data: CreateBenefitInput): Promise<Benefit>
  update(projectId: string, id: string, data: UpdateBenefitInput): Promise<Benefit>
  delete(projectId: string, id: string): Promise<void>
}
