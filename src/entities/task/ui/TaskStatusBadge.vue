<script setup lang="ts">
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '../model/task.types'
import type { TaskStatus, TaskPriority } from '../model/task.types'

defineProps<{
  status?: TaskStatus
  priority?: TaskPriority
}>()
</script>

<template>
  <BaseBadge v-if="status" :color="TASK_STATUS_CONFIG[status].color">
    {{ TASK_STATUS_CONFIG[status].label }}
  </BaseBadge>
  <BaseBadge v-else-if="priority" :color="TASK_PRIORITY_CONFIG[priority].color">
    {{ TASK_PRIORITY_CONFIG[priority].label }}
  </BaseBadge>
</template>
