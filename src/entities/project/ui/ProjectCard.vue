<script setup lang="ts">
import type { Project } from '../model/project.types'
import { PROJECT_STATUS_CONFIG } from '../model/project.types'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import { formatDate } from '@/shared/lib/helpers/date'

defineProps<{ project: Project }>()
defineEmits<{ click: [project: Project] }>()
</script>

<template>
  <article class="project-card" @click="$emit('click', project)">
    <div class="project-card__color-bar" :style="{ backgroundColor: project.color }" />

    <div class="project-card__body">
      <div class="project-card__header">
        <h3 class="project-card__name">{{ project.name }}</h3>
        <BaseBadge :color="PROJECT_STATUS_CONFIG[project.status].color">
          {{ PROJECT_STATUS_CONFIG[project.status].label }}
        </BaseBadge>
      </div>

      <p class="project-card__desc">{{ project.description }}</p>

      <div class="project-card__progress">
        <div class="project-card__progress-bar">
          <div
            class="project-card__progress-fill"
            :style="{
              width: `${project.taskCount ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0}%`,
              backgroundColor: project.color,
            }"
          />
        </div>
        <span class="project-card__progress-label">
          {{ project.completedTaskCount }}/{{ project.taskCount }} tasks
        </span>
      </div>

      <div class="project-card__meta">
        <span class="project-card__members">👥 {{ project.memberIds.length }}</span>
        <span v-if="project.deadline" class="project-card__deadline">
          📅 {{ formatDate(project.deadline) }}
        </span>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.project-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
  overflow: hidden;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__color-bar { height: 4px; }

  &__body { padding: 1rem 1.125rem; }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  &__name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  &__desc {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    margin: 0 0 0.875rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 0.75rem;
  }

  &__progress-bar {
    flex: 1;
    height: 6px;
    background: var(--color-surface-raised);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.3s;
  }

  &__progress-label {
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    gap: 0.875rem;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
}
</style>
