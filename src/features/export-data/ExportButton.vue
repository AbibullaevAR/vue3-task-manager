<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { exportCSV, exportJSON } from '@/shared/lib/helpers/export'
import type { Task } from '@/entities/task/model/task.types'

const props = defineProps<{ tasks: Task[] }>()

const showMenu = ref(false)

function doExportCSV() {
  exportCSV(props.tasks, 'tasks-export', ['id', 'title', 'status', 'priority', 'projectId', 'assigneeId', 'deadline', 'estimatedHours', 'tags', 'createdAt'])
  showMenu.value = false
}

function doExportJSON() {
  exportJSON(props.tasks, 'tasks-export')
  showMenu.value = false
}
</script>

<template>
  <div class="export-btn">
    <BaseButton variant="secondary" size="sm" @click="showMenu = !showMenu">
      ↓ Export
    </BaseButton>

    <div v-if="showMenu" class="export-btn__menu">
      <button class="export-btn__item" @click="doExportCSV">Export as CSV</button>
      <button class="export-btn__item" @click="doExportJSON">Export as JSON</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.export-btn {
  position: relative;

  &__menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    min-width: 160px;
    z-index: 50;
    overflow: hidden;
  }

  &__item {
    display: block;
    width: 100%;
    padding: 0.625rem 1rem;
    background: none;
    border: none;
    text-align: left;
    font-size: 0.875rem;
    color: var(--color-text);
    cursor: pointer;
    transition: background-color 0.1s;

    &:hover { background: var(--color-surface-hover); }
  }
}
</style>
