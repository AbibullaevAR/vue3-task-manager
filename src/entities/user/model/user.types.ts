export type UserRole = 'admin' | 'member' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  role: UserRole
  createdAt: string
}
