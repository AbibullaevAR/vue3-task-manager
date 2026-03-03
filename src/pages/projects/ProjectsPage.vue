<script setup lang="ts">
import { onMounted } from 'vue'
import { useProjectStore } from '@/entities/project/model/project.store'
import { useTaskStore } from '@/entities/task/model/task.store'
import ProjectCard from '@/entities/project/ui/ProjectCard.vue'
import type { Project } from '@/entities/project/model/project.types'
import { useRouter } from 'vue-router'

const projectStore = useProjectStore()
const taskStore = useTaskStore()
const router = useRouter()

onMounted(async () => {
  await Promise.all([projectStore.fetchProjects(), taskStore.fetchTasks()])
})

function onProjectClick(project: Project) {
  router.push({ name: 'kanban', query: { projectId: project.id } })
}
</script>

<template>
  <div class="projects-page">
    <header class="projects-page__header">
      <div>
        <h1 class="projects-page__title">Projects</h1>
        <p class="projects-page__subtitle">
          {{ projectStore.activeProjects.length }} active projects
        </p>
      </div>
    </header>

    <div v-if="projectStore.isLoading" class="projects-page__loading">
      Loading projects…
    </div>

    <div v-else-if="!projectStore.projects.length" class="projects-page__empty">
      <p>No projects yet. Create one to get started.</p>
    </div>

    <div v-else class="projects-page__grid">
      <ProjectCard
        v-for="project in projectStore.projects"
        :key="project.id"
        :project="project"
        @click="onProjectClick"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.projects-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 0.25rem;
  }

  &__subtitle {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--color-text-secondary);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.25rem;
  }
}
</style>
