import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import type { Project, ProjectCreatePayload, ProjectUpdatePayload } from './project.types'
import { projectApi } from '../api/project.api'

export const useProjectStore = defineStore('project', () => {
  const projects = shallowRef<Project[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeProjects = computed(() =>
    projects.value.filter((p) => p.status === 'active'),
  )

  const projectsById = computed(() => {
    const map = new Map<string, Project>()
    for (const p of projects.value) map.set(p.id, p)
    return map
  })

  async function fetchProjects(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      projects.value = await projectApi.getProjects()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch projects'
    } finally {
      isLoading.value = false
    }
  }

  async function createProject(payload: ProjectCreatePayload): Promise<Project> {
    const created = await projectApi.create(payload)
    projects.value = [...projects.value, created]
    return created
  }

  async function updateProject(id: string, payload: ProjectUpdatePayload): Promise<void> {
    const previous = [...projects.value]
    projects.value = projects.value.map((p) =>
      p.id === id ? { ...p, ...payload, updatedAt: new Date().toISOString() } : p,
    )
    try {
      const updated = await projectApi.update(id, payload)
      projects.value = projects.value.map((p) => (p.id === id ? updated : p))
    } catch (err) {
      projects.value = previous
      throw err
    }
  }

  async function deleteProject(id: string): Promise<void> {
    const previous = [...projects.value]
    projects.value = projects.value.filter((p) => p.id !== id)
    try {
      await projectApi.delete(id)
    } catch (err) {
      projects.value = previous
      throw err
    }
  }

  function $reset(): void {
    projects.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    projects,
    isLoading,
    error,
    activeProjects,
    projectsById,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    $reset,
  }
})
