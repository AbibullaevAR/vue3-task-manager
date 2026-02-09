<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '@/entities/task/model/task.store'
import { useProjectStore } from '@/entities/project/model/project.store'
import { useUserStore } from '@/entities/user/model/user.store'
import TaskBoard from '@/widgets/task-board/TaskBoard.vue'
import CreateTaskModal from '@/features/create-task/CreateTaskModal.vue'
import FilterPanel from '@/features/filter-tasks/FilterPanel.vue'
import ExportButton from '@/features/export-data/ExportButton.vue'
import type { Task, TaskStatus, TaskFilters } from '@/entities/task/model/task.types'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

const showCreateModal = ref(false)
const showFilters = ref(false)
const createDefaultStatus = ref<TaskStatus>('todo')
const filters = ref<TaskFilters>({})

onMounted(async () => {
  await Promise.all([
    taskStore.fetchTasks(),
    projectStore.fetchProjects(),
    userStore.fetchUsers(),
  ])
})

function openCreateModal(status: TaskStatus = 'todo') {
  createDefaultStatus.value = status
  showCreateModal.value = true
}

async function handleCreateTask(payload: Parameters<typeof taskStore.createTask>[0]) {
  try {
    await taskStore.createTask(payload)
    showCreateModal.value = false
  } catch (e) {
    console.error('Failed to create task', e)
  }
}

const filteredTaskCount = computed(() => taskStore.getFilteredTasks(filters.value).length)
</script>

<template>
  <div class="kanban-page">
    <header class="kanban-page__header">
      <div class="kanban-page__title-row">
        <h1 class="kanban-page__title">Kanban Board</h1>
        <span class="kanban-page__count">{{ taskStore.totalTasks }} tasks</span>
      </div>

      <div class="kanban-page__actions">
        <button
          class="kanban-page__filter-btn"
          :class="{ 'kanban-page__filter-btn--active': showFilters }"
          @click="showFilters = !showFilters"
        >
          🔍 Filters
        </button>
        <ExportButton :tasks="taskStore.tasks" />
        <button class="kanban-page__create-btn" @click="openCreateModal()">
          + New Task
        </button>
      </div>
    </header>

    <!-- Filter panel -->
    <div v-if="showFilters" class="kanban-page__filters">
      <FilterPanel
        v-model="filters"
        :users="userStore.users"
        @reset="filters = {}"
      />
    </div>

    <!-- Loading state -->
    <div v-if="taskStore.isLoading" class="kanban-page__loading">
      Loading tasks…
    </div>

    <!-- Error state -->
    <div v-else-if="taskStore.error" class="kanban-page__error">
      ⚠️ {{ taskStore.error }}
      <button @click="taskStore.fetchTasks()">Retry</button>
    </div>

    <!-- Board -->
    <TaskBoard
      v-else
      class="kanban-page__board"
      @create-task="openCreateModal"
      @task-click="(task: Task) => console.log('Task clicked:', task.title)"
    />

    <!-- Create task modal -->
    <CreateTaskModal
      v-if="showCreateModal"
      :projects="projectStore.projects"
      :users="userStore.users"
      :default-status="createDefaultStatus"
      @submit="handleCreateTask"
      @close="showCreateModal = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.kanban-page {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  &__count {
    font-size: 0.8125rem;
    color: var(--color-text-secondary);
    background: var(--color-surface-raised);
    padding: 0.25rem 0.625rem;
    border-radius: var(--radius-full);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__filter-btn {
    padding: 0.5rem 0.875rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.15s;

    &:hover, &--active {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background: var(--color-primary-light);
    }
  }

  &__create-btn {
    padding: 0.5rem 1rem;
    background: var(--color-primary);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 0.15s;

    &:hover { background: var(--color-primary-hover); }
  }

  &__filters {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
  }

  &__loading,
  &__error {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--color-text-secondary);

    button {
      margin-left: 0.5rem;
      color: var(--color-primary);
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: underline;
    }
  }

  &__error { color: var(--color-danger); }

  &__board { flex: 1; }
}
</style>
