<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/entities/task/model/task.store'

const store = useTaskStore()

const stats = computed(() => [
  {
    label: 'Total Tasks',
    value: store.totalTasks,
    icon: '📋',
    color: '#6366f1',
  },
  {
    label: 'In Progress',
    value: store.tasksByStatus.in_progress.length,
    icon: '⚡',
    color: '#f59e0b',
  },
  {
    label: 'Completed',
    value: store.completedCount,
    extra: `${store.completionRate}%`,
    icon: '✅',
    color: '#10b981',
  },
  {
    label: 'Overdue',
    value: store.overdueCount,
    icon: '⚠️',
    color: '#ef4444',
  },
])
</script>

<template>
  <div class="stats-overview">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="stat-card"
      :style="{ '--stat-color': stat.color }"
    >
      <div class="stat-card__icon">{{ stat.icon }}</div>
      <div class="stat-card__body">
        <p class="stat-card__label">{{ stat.label }}</p>
        <div class="stat-card__value-row">
          <span class="stat-card__value">{{ stat.value }}</span>
          <span v-if="stat.extra" class="stat-card__extra">{{ stat.extra }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid var(--stat-color);

  &__icon { font-size: 1.75rem; line-height: 1; }

  &__body { flex: 1; min-width: 0; }

  &__label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.25rem;
  }

  &__value-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  &__value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1;
  }

  &__extra {
    font-size: 0.875rem;
    color: var(--stat-color);
    font-weight: 500;
  }
}
</style>
