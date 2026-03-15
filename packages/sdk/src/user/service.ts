import type { User, CreateUserInput, UpdateUserInput } from '../types/user.js'

export interface UserService {
  list(): Promise<User[]>
  get(id: string): Promise<User | undefined>
  create(data: CreateUserInput): Promise<User>
  update(id: string, data: UpdateUserInput): Promise<User>
  delete(id: string): Promise<void>
}
