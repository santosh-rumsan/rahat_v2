import type { Vendor, CreateVendorInput, UpdateVendorInput } from '../types/vendor.js'

export interface VendorService {
  list(): Promise<Vendor[]>
  get(id: string): Promise<Vendor | undefined>
  create(data: CreateVendorInput): Promise<Vendor>
  update(id: string, data: UpdateVendorInput): Promise<Vendor>
  delete(id: string): Promise<void>
}
