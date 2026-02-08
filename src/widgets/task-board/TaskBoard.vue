<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/entities/task/model/task.store'
import { useDragDrop } from '@/features/drag-drop'
import TaskCard from '@/entities/task/ui/TaskCard.vue'
import type { Task, TaskStatus } from '@/entities/task/model/task.types'
import { TASK_STATUS_CONFIG } from '@/entities/task/model/task.types'
import { WIP_LIMITS } from '@/shared/config/constants'

const emit = defineEmits<{
  'create-task': [status: TaskStatus]
  'task-click': [task: Task]
}>()

const taskStore = useTaskStore()

// Re-export KANBAN_COLUMNS from types for convenience
const columns = Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]

const { dragState, handleDragStart, handleDragOver, handleDragEnter, handleDragLeave, handleDrop, handleDragEnd } =
  useDragDrop<Task>({
    onReorder: (taskId, fromColumn, toColumn, newIndex) => {
      taskStore.moveTask(taskId, fromColumn, toColumn, newIndex)
    },
  })

function getColumnTasks(status: TaskStatus): Task[] {
  return taskStore.tasksByStatus[status] ?? []
}

function isOverLimit(status: TaskStatus): boolean {
  const limit = WIP_LIMITS[status]
  return limit !== undefined && getColumnTasks(status).length >= limit
}
</script>

<template>
  <div class="task-board">
    <div
      v-for="status in columns"
      :key="status"
      class="task-board__column"
      :class="{
        'task-board__column--over': dragState.overColumn === status,
        'task-board__column--over-limit': isOverLimit(status),
      }"
      @dragover.prevent="handleDragOver($event, status, getColumnTasks(status).length)"
      @dragenter.prevent="handleDragEnter($event, status)"
      @dragleave="handleDragLeave($event, status)"
      @drop="handleDrop($event, status, getColumnTasks(status).length)"
    >
      <!-- Column header -->
      <div class="task-board__col-header">
        <div class="task-board__col-title-row">
          <span
            class="task-board__col-dot"
            :style="{ backgroundColor: TASK_STATUS_CONFIG[status].color }"
          />
          <h3 class="task-board__col-title">{{ TASK_STATUS_CONFIG[status].label }}</h3>
          <span class="task-board__col-count">{{ getColumnTasks(status).length }}</span>
          <span v-if="WIP_LIMITS[status]" class="task-board__col-limit">
            / {{ WIP_LIMITS[status] }}
          </span>
        </div>
        <button
          class="task-board__add-btn"
          :aria-label="`Add task to ${TASK_STATUS_CONFIG[status].label}`"
          @click="$emit('create-task', status)"
        >
          +
        </button>
      </div>

      <!-- Cards -->
      <div class="task-board__cards">
        <TaskCard
          v-for="task in getColumnTasks(status)"
          :key="task.id"
          :task="task"
          :dragging="dragState.draggedItemId === task.id"
          draggable="true"
          @dragstart="handleDragStart($event, task, status)"
          @dragend="handleDragEnd"
          @click="$emit('task-click', task)"
          @delete="taskStore.deleteTask($event)"
        />

        <!-- Drop placeholder -->
        <div
          v-if="dragState.isDragging && dragState.overColumn === status && !getColumnTasks(status).length"
          class="task-board__drop-zone"
        >
          Drop here
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.task-board {
  display: grid;
  grid-template-columns: repeat(5, minmax(240px, 1fr));
  gap: 1rem;
  align-items: start;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, minmax(240px, 1fr));
  }

  @media (max-width: 780px) {
    grid-template-columns: repeat(2, minmax(240px, 1fr));
  }

  &__column {
    background: var(--color-surface-raised);
    border-radius: var(--radius-lg);
    border: 2px solid transparent;
    padding: 0.75rem;
    transition: border-color 0.15s, background-color 0.15s;

    &--over {
      border-color: var(--color-primary);
      background: var(--color-primary-light);
    }

    &--over-limit { border-color: var(--color-danger); }
  }

  &__col-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  &__col-title-row {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__col-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__col-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
  }

  &__col-count {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    background: var(--color-surface-hover);
    border-radius: var(--radius-full);
    padding: 0 0.375rem;
    font-weight: 500;
  }

  &__col-limit {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }

  &__add-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 1.125rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;

    &:hover {
      background: var(--color-primary);
      color: #fff;
      border-color: var(--color-primary);
    }
  }

  &__cards {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 60px;
  }

  &__drop-zone {
    border: 2px dashed var(--color-primary);
    border-radius: var(--radius-md);
    padding: 1.5rem;
    text-align: center;
    color: var(--color-primary);
    font-size: 0.8125rem;
  }
}
</style>
