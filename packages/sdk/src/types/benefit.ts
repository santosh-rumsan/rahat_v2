export type BenefitType = 'Cash' | 'Food' | 'WASH' | 'NFI' | 'Service'

export interface PackageItem {
  id: string
  name: string
  quantity: number
  costPerItem: number
}

export interface Benefit {
  id: string
  name: string
  type: BenefitType
  description?: string
  unit: string
  valuePerUnit: number
  isActive: boolean
  createdAt: string
  totalAmount?: number
  token?: string
  amountPerBeneficiary?: number
  packageItems?: PackageItem[]
  beneficiaryIds?: string[]
}

export type CreateBenefitInput = Omit<Benefit, 'id'>
export type UpdateBenefitInput = Partial<Omit<Benefit, 'id'>>

export type TokenStatus = 'Issued' | 'Redeemed' | 'Expired' | 'Voided'

export interface Token {
  id: string
  code: string
  beneficiaryId: string
  benefitId: string
  amount: number
  status: TokenStatus
  issuedDate: string
  redeemedDate?: string
  notes?: string
}

export type CreateTokenInput = Omit<Token, 'id'>
export type UpdateTokenInput = Partial<Omit<Token, 'id'>>
