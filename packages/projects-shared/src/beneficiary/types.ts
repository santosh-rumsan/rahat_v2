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
