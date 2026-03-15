export interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Field' | 'Finance' | 'Viewer'
  status: 'Active' | 'Inactive'
  phone: string
  avatar?: string
  joinedDate: string
  lastLogin?: string
  notes?: string
}

export type CreateUserInput = Omit<User, 'id' | 'joinedDate' | 'lastLogin'>

export type UpdateUserInput = Partial<Omit<User, 'id' | 'joinedDate'>>
