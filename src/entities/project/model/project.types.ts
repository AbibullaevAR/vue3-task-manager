export type ProjectStatus = 'active' | 'archived' | 'completed'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  color: string
  ownerId: string
  memberIds: string[]
  taskCount: number
  completedTaskCount: number
  deadline: string | null
  createdAt: string
  updatedAt: string
}

export interface ProjectCreatePayload {
  name: string
  description: string
  color: string
  deadline?: string
  memberIds?: string[]
}

export interface ProjectUpdatePayload extends Partial<ProjectCreatePayload> {
  status?: ProjectStatus
}

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: '#10b981' },
  archived: { label: 'Archived', color: '#94a3b8' },
  completed: { label: 'Completed', color: '#6366f1' },
}
