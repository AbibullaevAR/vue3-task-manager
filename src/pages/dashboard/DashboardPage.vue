<script setup lang="ts">
import { onMounted, defineAsyncComponent } from 'vue'
import { useTaskStore } from '@/entities/task/model/task.store'
import { useProjectStore } from '@/entities/project/model/project.store'
import { useUserStore } from '@/entities/user/model/user.store'
import { useTaskSelectors } from '@/entities/task/model/task.selectors'
import StatsOverview from '@/widgets/stats-overview/StatsOverview.vue'
import ActivityFeed from '@/widgets/activity-feed/ActivityFeed.vue'
import ProjectList from '@/widgets/project-list/ProjectList.vue'

const taskStore = useTaskStore()
const projectStore = useProjectStore()
const userStore = useUserStore()
const { burndownData, tagCloud } = useTaskSelectors()

onMounted(async () => {
  await Promise.all([
    taskStore.fetchTasks(),
    projectStore.fetchProjects(),
    userStore.fetchUsers(),
  ])
})
</script>

<template>
  <div class="dashboard-page">
    <header class="dashboard-page__header">
      <h1 class="dashboard-page__title">Dashboard</h1>
      <p class="dashboard-page__subtitle">Overview of all projects and tasks</p>
    </header>

    <StatsOverview class="dashboard-page__stats" />

    <div class="dashboard-page__grid">
      <div class="dashboard-page__main">
        <ProjectList />
      </div>

      <aside class="dashboard-page__sidebar">
        <ActivityFeed />

        <!-- Tag cloud -->
        <div v-if="tagCloud.length" class="tag-cloud">
          <h3 class="tag-cloud__title">Popular Tags</h3>
          <div class="tag-cloud__list">
            <span
              v-for="{ tag, count } in tagCloud.slice(0, 12)"
              :key="tag"
              class="tag-cloud__tag"
              :style="{ fontSize: `${0.7 + count * 0.08}rem` }"
            >
              {{ tag }}
              <sup>{{ count }}</sup>
            </span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  padding: 1.5rem;
  max-width: 1600px;
  margin: 0 auto;

  &__header { margin-bottom: 1.5rem; }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 0.25rem;
  }

  &__subtitle {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  &__stats { margin-bottom: 1.5rem; }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 1.5rem;
    align-items: start;

    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
    }
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

.tag-cloud {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 0.875rem;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: baseline;
  }

  &__tag {
    color: var(--color-primary);
    cursor: default;
    transition: color 0.15s;

    sup {
      font-size: 0.6em;
      color: var(--color-text-secondary);
    }

    &:hover { color: var(--color-primary-hover); }
  }
}
</style>
