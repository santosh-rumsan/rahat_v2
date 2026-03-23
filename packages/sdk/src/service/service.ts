import type { Service, CreateServiceInput, UpdateServiceInput } from '../types/service.js'

export interface ServiceService {
  list(): Promise<Service[]>
  get(id: string): Promise<Service | undefined>
  create(data: CreateServiceInput): Promise<Service>
  update(id: string, data: UpdateServiceInput): Promise<Service>
  delete(id: string): Promise<void>
}
