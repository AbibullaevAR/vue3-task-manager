import { httpRequest } from '@/shared/api/http-client'
import type { User } from '../model/user.types'

export const userApi = {
  getUsers(): Promise<User[]> {
    return httpRequest<User[]>('/users')
  },

  getUserById(id: string): Promise<User> {
    return httpRequest<User>(`/users/${id}`)
  },
}
