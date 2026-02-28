import { httpRequest } from '@/shared/api/http-client'
import type { Project, ProjectCreatePayload, ProjectUpdatePayload } from '../model/project.types'

export const projectApi = {
  getProjects(): Promise<Project[]> {
    return httpRequest<Project[]>('/projects')
  },

  getProjectById(id: string): Promise<Project> {
    return httpRequest<Project>(`/projects/${id}`)
  },

  create(payload: ProjectCreatePayload): Promise<Project> {
    return httpRequest<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  update(id: string, payload: ProjectUpdatePayload): Promise<Project> {
    return httpRequest<Project>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  delete(id: string): Promise<void> {
    return httpRequest<void>(`/projects/${id}`, { method: 'DELETE' })
  },
}
