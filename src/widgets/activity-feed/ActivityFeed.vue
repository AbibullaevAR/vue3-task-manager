<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/entities/task/model/task.store'
import { useUserStore } from '@/entities/user/model/user.store'
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/entities/task/model/task.types'
import { fromNow } from '@/shared/lib/helpers/date'

const taskStore = useTaskStore()
const userStore = useUserStore()

const recentActivity = computed(() => {
  return [...taskStore.tasks]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 10)
    .map((task) => ({
      task,
      user: userStore.getUserById(task.assigneeId ?? task.creatorId),
      timeAgo: fromNow(task.updatedAt),
      statusConfig: TASK_STATUS_CONFIG[task.status],
    }))
})
</script>

<template>
  <div class="activity-feed">
    <h3 class="activity-feed__title">Recent Activity</h3>

    <div v-if="!recentActivity.length" class="activity-feed__empty">
      No recent activity
    </div>

    <ul v-else class="activity-feed__list">
      <li
        v-for="{ task, user, timeAgo, statusConfig } in recentActivity"
        :key="task.id"
        class="activity-item"
      >
        <span class="activity-item__dot" :style="{ backgroundColor: statusConfig.color }" />

        <div class="activity-item__content">
          <p class="activity-item__text">
            <strong class="activity-item__user">{{ user?.name ?? 'Unknown' }}</strong>
            updated
            <span class="activity-item__task">{{ task.title }}</span>
            →
            <span :style="{ color: statusConfig.color }">{{ statusConfig.label }}</span>
          </p>
          <time class="activity-item__time" :datetime="task.updatedAt">{{ timeAgo }}</time>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.activity-feed {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 1rem;
  }

  &__empty {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    text-align: center;
    padding: 1.5rem 0;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--color-border);
  position: relative;

  &:last-child { border-bottom: none; }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 0.3125rem;
  }

  &__content { flex: 1; min-width: 0; }

  &__text {
    font-size: 0.8125rem;
    color: var(--color-text);
    margin: 0 0 0.125rem;
    line-height: 1.4;
  }

  &__user { font-weight: 600; }

  &__task {
    font-style: italic;
    color: var(--color-text-secondary);
  }

  &__time {
    font-size: 0.6875rem;
    color: var(--color-text-secondary);
  }
}
</style>
