export interface Vendor {
  id: string
  name: string
  type: string
  contactPerson: string
  email: string
  phone: string
  status: 'Active' | 'Inactive' | 'Pending'
  location?: string
  notes?: string
}

export type CreateVendorInput = Omit<Vendor, 'id'>

export type UpdateVendorInput = Partial<Omit<Vendor, 'id'>>
