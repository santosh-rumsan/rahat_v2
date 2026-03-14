export interface Beneficiary {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  location: string
  phone?: string
  status: 'Verified' | 'Pending' | 'Inactive'
  enrolledDate: string
  householdSize?: number
  notes?: string
}

export interface BeneficiaryGroup {
  id: string
  name: string
  description?: string
  beneficiaryIds: string[]
  createdAt: string
}

export type CreateBeneficiaryInput = Omit<Beneficiary, 'id' | 'enrolledDate'> & {
  enrolledDate?: string
}

export type UpdateBeneficiaryInput = Partial<Omit<Beneficiary, 'id'>>
