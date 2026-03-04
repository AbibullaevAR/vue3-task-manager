import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '@/entities/task/model/task.store'
import { taskApi } from '@/entities/task/api/task.api'
import type { Task, TaskStatus } from '@/entities/task/model/task.types'

// Mock the API module
vi.mock('@/entities/task/api/task.api', () => ({
  taskApi: {
    getTasks: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
  },
}))

const mockTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'todo',
  priority: 'medium',
  projectId: 'project-1',
  assigneeId: null,
  creatorId: 'user-1',
  tags: ['frontend'],
  deadline: null,
  estimatedHours: 4,
  order: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

describe('useTaskStore', () => {
  let store: ReturnType<typeof useTaskStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTaskStore()
    vi.clearAllMocks()
  })

  describe('Initial state', () => {
    it('starts with empty state', () => {
      expect(store.tasks).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('groups tasks by status', () => {
      store.tasks = [
        mockTask({ id: '1', status: 'todo', order: 0 }),
        mockTask({ id: '2', status: 'in_progress', order: 0 }),
        mockTask({ id: '3', status: 'todo', order: 1 }),
        mockTask({ id: '4', status: 'done', order: 0 }),
      ]

      expect(store.tasksByStatus.todo).toHaveLength(2)
      expect(store.tasksByStatus.in_progress).toHaveLength(1)
      expect(store.tasksByStatus.done).toHaveLength(1)
      expect(store.tasksByStatus.backlog).toHaveLength(0)
    })

    it('sorts tasks within status by order', () => {
      store.tasks = [
        mockTask({ id: '1', status: 'todo', order: 2 }),
        mockTask({ id: '2', status: 'todo', order: 0 }),
        mockTask({ id: '3', status: 'todo', order: 1 }),
      ]

      const todoTasks = store.tasksByStatus.todo
      expect(todoTasks[0].id).toBe('2')
      expect(todoTasks[1].id).toBe('3')
      expect(todoTasks[2].id).toBe('1')
    })

    it('calculates completion rate', () => {
      store.tasks = [
        mockTask({ id: '1', status: 'done' }),
        mockTask({ id: '2', status: 'todo' }),
        mockTask({ id: '3', status: 'done' }),
        mockTask({ id: '4', status: 'in_progress' }),
      ]

      expect(store.completedCount).toBe(2)
      expect(store.completionRate).toBe(50)
    })

    it('returns 0% completion for empty tasks', () => {
      expect(store.completionRate).toBe(0)
    })

    it('counts overdue tasks', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString()
      const futureDate = new Date(Date.now() + 86400000).toISOString()

      store.tasks = [
        mockTask({ id: '1', deadline: pastDate, status: 'todo' }),      // overdue
        mockTask({ id: '2', deadline: pastDate, status: 'done' }),      // past but done
        mockTask({ id: '3', deadline: futureDate, status: 'todo' }),    // not overdue
        mockTask({ id: '4', deadline: null, status: 'todo' }),          // no deadline
      ]

      expect(store.overdueCount).toBe(1)
    })
  })

  describe('getFilteredTasks', () => {
    beforeEach(() => {
      store.tasks = [
        mockTask({ id: '1', status: 'todo', priority: 'high', tags: ['frontend'] }),
        mockTask({ id: '2', status: 'done', priority: 'low', tags: ['backend'] }),
        mockTask({ id: '3', status: 'todo', priority: 'medium', tags: ['frontend', 'ui'] }),
        mockTask({ id: '4', status: 'in_progress', priority: 'high', assigneeId: 'user-1', tags: [] }),
      ]
    })

    it('filters by status', () => {
      const result = store.getFilteredTasks({ status: ['todo'] })
      expect(result).toHaveLength(2)
    })

    it('filters by priority', () => {
      const result = store.getFilteredTasks({ priority: ['high'] })
      expect(result).toHaveLength(2)
    })

    it('filters by assignee', () => {
      const result = store.getFilteredTasks({ assigneeId: 'user-1' })
      expect(result).toHaveLength(1)
    })

    it('filters by tags', () => {
      const result = store.getFilteredTasks({ tags: ['frontend'] })
      expect(result).toHaveLength(2)
    })

    it('filters by search query', () => {
      store.tasks = [
        mockTask({ id: '1', title: 'Fix login bug' }),
        mockTask({ id: '2', title: 'Add dark mode' }),
        mockTask({ id: '3', description: 'Related to login flow' }),
      ]

      const result = store.getFilteredTasks({ search: 'login' })
      expect(result).toHaveLength(2)
    })

    it('combines multiple filters', () => {
      const result = store.getFilteredTasks({
        status: ['todo'],
        priority: ['high'],
      })
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })
  })

  describe('fetchTasks', () => {
    it('fetches and sets tasks', async () => {
      const mockTasks = [mockTask({ id: '1' }), mockTask({ id: '2' })]
      vi.mocked(taskApi.getTasks).mockResolvedValueOnce(mockTasks)

      await store.fetchTasks()

      expect(store.tasks).toEqual(mockTasks)
      expect(store.isLoading).toBe(false)
    })

    it('handles fetch error', async () => {
      vi.mocked(taskApi.getTasks).mockRejectedValueOnce(new Error('Network error'))

      await store.fetchTasks()

      expect(store.error).toBe('Network error')
      expect(store.tasks).toEqual([])
    })

    it('sets loading state during fetch', async () => {
      let resolvePromise: (value: Task[]) => void
      vi.mocked(taskApi.getTasks).mockReturnValueOnce(
        new Promise((resolve) => { resolvePromise = resolve }),
      )

      const fetchPromise = store.fetchTasks()
      expect(store.isLoading).toBe(true)

      resolvePromise!([])
      await fetchPromise
      expect(store.isLoading).toBe(false)
    })
  })

  describe('createTask (optimistic)', () => {
    it('adds task optimistically then replaces with API response', async () => {
      const payload = {
        title: 'New Task',
        description: 'Description',
        status: 'todo' as TaskStatus,
        priority: 'medium' as const,
        projectId: 'project-1',
      }

      const apiTask = mockTask({ id: 'real-id', title: 'New Task' })
      vi.mocked(taskApi.create).mockResolvedValueOnce(apiTask)

      await store.createTask(payload)

      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0].id).toBe('real-id')
    })

    it('rolls back on API failure', async () => {
      vi.mocked(taskApi.create).mockRejectedValueOnce(new Error('Server error'))

      await expect(
        store.createTask({
          title: 'Failing Task',
          description: '',
          status: 'todo',
          priority: 'low',
          projectId: 'project-1',
        }),
      ).rejects.toThrow('Server error')

      expect(store.tasks).toHaveLength(0)
    })
  })

  describe('deleteTask (optimistic)', () => {
    it('removes task optimistically', async () => {
      store.tasks = [mockTask({ id: '1' }), mockTask({ id: '2' })]
      vi.mocked(taskApi.delete).mockResolvedValueOnce(undefined)

      await store.deleteTask('1')

      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0].id).toBe('2')
    })

    it('restores task on API failure', async () => {
      store.tasks = [mockTask({ id: '1' }), mockTask({ id: '2' })]
      vi.mocked(taskApi.delete).mockRejectedValueOnce(new Error('Cannot delete'))

      await expect(store.deleteTask('1')).rejects.toThrow()

      expect(store.tasks).toHaveLength(2)
    })
  })

  describe('$reset', () => {
    it('resets all state to initial values', () => {
      store.tasks = [mockTask()]
      store.isLoading = true
      store.error = 'Some error'

      store.$reset()

      expect(store.tasks).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })
})
