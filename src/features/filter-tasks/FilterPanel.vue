<script setup lang="ts">
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/entities/task/model/task.types'
import type { TaskFilters, TaskStatus, TaskPriority } from '@/entities/task/model/task.types'
import type { User } from '@/entities/user/model/user.types'
import BaseButton from '@/shared/ui/BaseButton.vue'

const props = defineProps<{
  modelValue: TaskFilters
  users?: User[]
}>()

const emit = defineEmits<{
  'update:modelValue': [filters: TaskFilters]
  reset: []
}>()

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

function updateStatus(s: TaskStatus) {
  emit('update:modelValue', {
    ...props.modelValue,
    status: toggle(props.modelValue.status ?? [], s),
  })
}

function updatePriority(p: TaskPriority) {
  emit('update:modelValue', {
    ...props.modelValue,
    priority: toggle(props.modelValue.priority ?? [], p),
  })
}

function updateSearch(e: Event) {
  emit('update:modelValue', {
    ...props.modelValue,
    search: (e.target as HTMLInputElement).value,
  })
}

function updateAssignee(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:modelValue', { ...props.modelValue, assigneeId: val || undefined })
}
</script>

<template>
  <div class="filter-panel">
    <div class="filter-panel__section">
      <label class="filter-panel__label">Search</label>
      <input
        class="filter-panel__input"
        type="text"
        placeholder="Search tasks..."
        :value="modelValue.search ?? ''"
        @input="updateSearch"
      />
    </div>

    <div class="filter-panel__section">
      <label class="filter-panel__label">Status</label>
      <div class="filter-panel__chips">
        <button
          v-for="(cfg, status) in TASK_STATUS_CONFIG"
          :key="status"
          class="filter-panel__chip"
          :class="{ 'filter-panel__chip--active': modelValue.status?.includes(status as TaskStatus) }"
          :style="modelValue.status?.includes(status as TaskStatus) ? { backgroundColor: cfg.color, color: '#fff', borderColor: cfg.color } : {}"
          @click="updateStatus(status as TaskStatus)"
        >
          {{ cfg.label }}
        </button>
      </div>
    </div>

    <div class="filter-panel__section">
      <label class="filter-panel__label">Priority</label>
      <div class="filter-panel__chips">
        <button
          v-for="(cfg, priority) in TASK_PRIORITY_CONFIG"
          :key="priority"
          class="filter-panel__chip"
          :class="{ 'filter-panel__chip--active': modelValue.priority?.includes(priority as TaskPriority) }"
          :style="modelValue.priority?.includes(priority as TaskPriority) ? { backgroundColor: cfg.color, color: '#fff', borderColor: cfg.color } : {}"
          @click="updatePriority(priority as TaskPriority)"
        >
          {{ cfg.label }}
        </button>
      </div>
    </div>

    <div v-if="users?.length" class="filter-panel__section">
      <label class="filter-panel__label">Assignee</label>
      <select class="filter-panel__select" :value="modelValue.assigneeId ?? ''" @change="updateAssignee">
        <option value="">All</option>
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.name }}
        </option>
      </select>
    </div>

    <BaseButton variant="ghost" size="sm" @click="$emit('reset')">Reset filters</BaseButton>
  </div>
</template>

<style lang="scss" scoped>
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__section { display: flex; flex-direction: column; gap: 0.5rem; }

  &__label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__input,
  &__select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: 0.875rem;
    width: 100%;
    outline: none;

    &:focus { border-color: var(--color-primary); }
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  &__chip {
    padding: 0.25rem 0.625rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not(&--active) { background: var(--color-surface-hover); color: var(--color-text); }
  }
}
</style>
