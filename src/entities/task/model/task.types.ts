export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeId: string | null
  creatorId: string
  tags: string[]
  deadline: string | null
  estimatedHours: number | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface TaskCreatePayload {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeId?: string
  tags?: string[]
  deadline?: string
  estimatedHours?: number
}

export interface TaskUpdatePayload extends Partial<TaskCreatePayload> {
  order?: number
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assigneeId?: string
  projectId?: string
  search?: string
  sortBy?: 'newest' | 'oldest' | 'priority' | 'deadline'
  tags?: string[]
}

export interface TaskBoardColumn {
  id: TaskStatus
  title: string
  color: string
  tasks: Task[]
  limit?: number // WIP limit
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  backlog: { label: 'Backlog', color: '#94a3b8', icon: 'inbox' },
  todo: { label: 'To Do', color: '#3b82f6', icon: 'circle' },
  in_progress: { label: 'In Progress', color: '#f59e0b', icon: 'loader' },
  review: { label: 'Review', color: '#8b5cf6', icon: 'eye' },
  done: { label: 'Done', color: '#10b981', icon: 'check-circle' },
}

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; weight: number }> = {
  low: { label: 'Low', color: '#94a3b8', weight: 1 },
  medium: { label: 'Medium', color: '#3b82f6', weight: 2 },
  high: { label: 'High', color: '#f59e0b', weight: 3 },
  critical: { label: 'Critical', color: '#ef4444', weight: 4 },
}
