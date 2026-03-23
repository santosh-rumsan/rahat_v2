export interface Beneficiary {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  location: string
  phone?: string
  email?: string
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
