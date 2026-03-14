export type BenefitType = 'Cash' | 'Food' | 'WASH' | 'NFI' | 'Service'

export interface Benefit {
  id: string
  name: string
  type: BenefitType
  description?: string
  unit: string         // e.g. "NPR", "KG", "Liters", "Kit"
  valuePerUnit: number
  isActive: boolean
  createdAt: string
}

export type TokenStatus = 'Issued' | 'Redeemed' | 'Expired' | 'Voided'

export interface Token {
  id: string
  code: string
  beneficiaryId: string
  benefitId: string
  amount: number       // quantity in the benefit's unit
  status: TokenStatus
  issuedDate: string
  redeemedDate?: string
  notes?: string
}
