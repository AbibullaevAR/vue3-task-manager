import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type { User } from './user.types'
import { userApi } from '../api/user.api'

export const useUserStore = defineStore('user', () => {
  const users = shallowRef<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const usersById = computed(() => {
    const map = new Map<string, User>()
    for (const u of users.value) map.set(u.id, u)
    return map
  })

  function getUserById(id: string): User | undefined {
    return usersById.value.get(id)
  }

  async function fetchUsers(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      users.value = await userApi.getUsers()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users'
    } finally {
      isLoading.value = false
    }
  }

  return { users, isLoading, error, usersById, getUserById, fetchUsers }
})
