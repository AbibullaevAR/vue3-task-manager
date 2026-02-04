import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type { Task, TaskStatus, TaskCreatePayload, TaskUpdatePayload, TaskFilters } from './task.types'
import { taskApi } from '../api/task.api'

export const useTaskStore = defineStore('task', () => {
  // Using shallowRef for large arrays — avoids deep reactivity overhead
  const tasks = shallowRef<Task[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Optimistic update rollback stack
  const rollbackStack = ref<Map<string, Task[]>>(new Map())

  // Getters
  const tasksByStatus = computed(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    }

    for (const task of tasks.value) {
      grouped[task.status].push(task)
    }

    // Sort within each column by order
    for (const status in grouped) {
      grouped[status as TaskStatus].sort((a, b) => a.order - b.order)
    }

    return grouped
  })

  const totalTasks = computed(() => tasks.value.length)

  const completedCount = computed(() =>
    tasks.value.filter((t) => t.status === 'done').length,
  )

  const completionRate = computed(() =>
    totalTasks.value > 0
      ? Math.round((completedCount.value / totalTasks.value) * 100)
      : 0,
  )

  const overdueCount = computed(() =>
    tasks.value.filter(
      (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done',
    ).length,
  )

  // Filter tasks based on criteria
  function getFilteredTasks(filters: TaskFilters): Task[] {
    return tasks.value.filter((task) => {
      if (filters.status?.length && !filters.status.includes(task.status)) return false
      if (filters.priority?.length && !filters.priority.includes(task.priority)) return false
      if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false
      if (filters.projectId && task.projectId !== filters.projectId) return false
      if (filters.tags?.length && !filters.tags.some((tag) => task.tags.includes(tag))) return false
      if (filters.search) {
        const query = filters.search.toLowerCase()
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
        )
      }
      return true
    })
  }

  // Actions
  async function fetchTasks(projectId?: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await taskApi.getTasks(projectId)
      tasks.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tasks'
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(payload: TaskCreatePayload): Promise<Task> {
    const tempId = `temp-${Date.now()}`

    // Optimistic: add task immediately
    const optimisticTask: Task = {
      id: tempId,
      ...payload,
      assigneeId: payload.assigneeId || null,
      tags: payload.tags || [],
      deadline: payload.deadline || null,
      estimatedHours: payload.estimatedHours || null,
      order: tasks.value.filter((t) => t.status === payload.status).length,
      creatorId: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const previousTasks = [...tasks.value]
    tasks.value = [...tasks.value, optimisticTask]

    try {
      const created = await taskApi.create(payload)
      // Replace temp task with real one
      tasks.value = tasks.value.map((t) => (t.id === tempId ? created : t))
      return created
    } catch (err) {
      // Rollback on failure
      tasks.value = previousTasks
      throw err
    }
  }

  async function updateTask(taskId: string, payload: TaskUpdatePayload): Promise<void> {
    const previousTasks = [...tasks.value]

    // Optimistic update
    tasks.value = tasks.value.map((t) =>
      t.id === taskId ? { ...t, ...payload, updatedAt: new Date().toISOString() } : t,
    )

    try {
      const updated = await taskApi.update(taskId, payload)
      tasks.value = tasks.value.map((t) => (t.id === taskId ? updated : t))
    } catch (err) {
      // Rollback
      tasks.value = previousTasks
      throw err
    }
  }

  /**
   * Move task between columns or reorder within a column.
   * Implements optimistic update with rollback.
   */
  async function moveTask(
    taskId: string,
    fromStatus: string,
    toStatus: string,
    newIndex: number,
  ): Promise<void> {
    const previousTasks = [...tasks.value]

    // Optimistic reorder
    const updatedTasks = [...tasks.value]
    const taskIndex = updatedTasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) return

    const task = { ...updatedTasks[taskIndex] }
    task.status = toStatus as TaskStatus
    task.updatedAt = new Date().toISOString()

    // Remove from old position
    updatedTasks.splice(taskIndex, 1)

    // Calculate new position in target column
    const targetColumnTasks = updatedTasks.filter((t) => t.status === toStatus)
    const insertIndex = updatedTasks.indexOf(targetColumnTasks[newIndex] || updatedTasks[updatedTasks.length - 1])
    updatedTasks.splice(insertIndex >= 0 ? insertIndex : updatedTasks.length, 0, task)

    // Update order values
    const statusGroups = new Map<string, Task[]>()
    for (const t of updatedTasks) {
      const group = statusGroups.get(t.status) || []
      group.push(t)
      statusGroups.set(t.status, group)
    }
    for (const [, group] of statusGroups) {
      group.forEach((t, i) => { t.order = i })
    }

    tasks.value = updatedTasks

    try {
      await taskApi.reorder(taskId, {
        status: toStatus as TaskStatus,
        order: newIndex,
      })
    } catch (err) {
      // Rollback on API failure
      tasks.value = previousTasks
      throw err
    }
  }

  async function deleteTask(taskId: string): Promise<void> {
    const previousTasks = [...tasks.value]

    // Optimistic delete
    tasks.value = tasks.value.filter((t) => t.id !== taskId)

    try {
      await taskApi.delete(taskId)
    } catch (err) {
      tasks.value = previousTasks
      throw err
    }
  }

  function $reset(): void {
    tasks.value = []
    isLoading.value = false
    error.value = null
    rollbackStack.value.clear()
  }

  return {
    // State
    tasks,
    isLoading,
    error,
    // Getters
    tasksByStatus,
    totalTasks,
    completedCount,
    completionRate,
    overdueCount,
    // Methods
    getFilteredTasks,
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    $reset,
  }
})
