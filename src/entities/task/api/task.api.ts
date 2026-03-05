import type { Task, TaskCreatePayload, TaskUpdatePayload, TaskStatus } from '../model/task.types'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
    return undefined as T
  }

  return response.json()
}

export const taskApi = {
  getTasks(projectId?: string): Promise<Task[]> {
    const params = projectId ? `?projectId=${projectId}` : ''
    return request<Task[]>(`/tasks${params}`)
  },

  getTaskById(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}`)
  },

  create(payload: TaskCreatePayload): Promise<Task> {
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(id: string, payload: TaskUpdatePayload): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  reorder(id: string, payload: { status: TaskStatus; order: number }): Promise<void> {
    return request<void>(`/tasks/${id}/reorder`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  delete(id: string): Promise<void> {
    return request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    })
  },
}
