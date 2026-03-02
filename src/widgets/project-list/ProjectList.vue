<script setup lang="ts">
import { useProjectStore } from '@/entities/project/model/project.store'
import ProjectCard from '@/entities/project/ui/ProjectCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import type { Project } from '@/entities/project/model/project.types'
import { useRouter } from 'vue-router'

const projectStore = useProjectStore()
const router = useRouter()

function onProjectClick(project: Project) {
  router.push({ path: '/projects', query: { id: project.id } })
}
</script>

<template>
  <div class="project-list">
    <div class="project-list__header">
      <h3 class="project-list__title">Projects</h3>
      <span class="project-list__count">{{ projectStore.activeProjects.length }} active</span>
    </div>

    <div v-if="projectStore.isLoading" class="project-list__loading">Loading projects…</div>

    <div v-else-if="!projectStore.projects.length" class="project-list__empty">
      <p>No projects yet</p>
    </div>

    <div v-else class="project-list__grid">
      <ProjectCard
        v-for="project in projectStore.activeProjects"
        :key="project.id"
        :project="project"
        @click="onProjectClick"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.project-list {
  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  &__count {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    background: var(--color-surface-raised);
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-full);
  }

  &__loading,
  &__empty {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: center;
    padding: 2rem 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }
}
</style>
