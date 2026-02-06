<script setup lang="ts">
import type { Task } from '../model/task.types'
import { TASK_PRIORITY_CONFIG } from '../model/task.types'
import TaskStatusBadge from './TaskStatusBadge.vue'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import { formatDate, daysUntil } from '@/shared/lib/helpers/date'

const props = defineProps<{
  task: Task
  dragging?: boolean
}>()

defineEmits<{
  click: [task: Task]
  delete: [taskId: string]
}>()

const priorityConfig = TASK_PRIORITY_CONFIG

function deadlineClass(task: Task): string {
  const days = daysUntil(task.deadline)
  if (days === null) return ''
  if (days < 0) return 'task-card__deadline--overdue'
  if (days <= 2) return 'task-card__deadline--urgent'
  return ''
}
</script>

<template>
  <article
    class="task-card"
    :class="{
      'task-card--dragging': dragging,
      [`task-card--priority-${task.priority}`]: true,
    }"
    @click="$emit('click', task)"
  >
    <!-- Priority indicator -->
    <div
      class="task-card__priority-bar"
      :style="{ backgroundColor: priorityConfig[task.priority].color }"
    />

    <div class="task-card__content">
      <header class="task-card__header">
        <TaskStatusBadge :priority="task.priority" />
        <button
          class="task-card__delete"
          aria-label="Delete task"
          @click.stop="$emit('delete', task.id)"
        >
          ✕
        </button>
      </header>

      <h3 class="task-card__title">{{ task.title }}</h3>

      <p v-if="task.description" class="task-card__desc">{{ task.description }}</p>

      <div class="task-card__tags">
        <BaseBadge v-for="tag in task.tags.slice(0, 3)" :key="tag" size="sm">
          {{ tag }}
        </BaseBadge>
      </div>

      <footer class="task-card__footer">
        <span
          v-if="task.deadline"
          class="task-card__deadline"
          :class="deadlineClass(task)"
        >
          📅 {{ formatDate(task.deadline) }}
        </span>
        <span v-if="task.estimatedHours" class="task-card__hours">
          ⏱ {{ task.estimatedHours }}h
        </span>
      </footer>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.task-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
  overflow: hidden;
  display: flex;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  &--dragging {
    opacity: 0.4;
    box-shadow: none;
    transform: none;
  }

  &__priority-bar {
    width: 4px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    padding: 0.75rem 0.875rem;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  &__delete {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.125rem 0.25rem;
    border-radius: var(--radius-sm);
    opacity: 0;
    transition: opacity 0.15s, background-color 0.15s;

    &:hover { background: var(--color-danger-light); color: var(--color-danger); }
  }

  &:hover &__delete { opacity: 1; }

  &__title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text);
    margin: 0 0 0.375rem;
    line-height: 1.4;
    word-break: break-word;
  }

  &__desc {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    margin: 0 0 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
  }

  &__deadline {
    &--overdue { color: var(--color-danger); font-weight: 500; }
    &--urgent { color: var(--color-warning); font-weight: 500; }
  }
}
</style>
