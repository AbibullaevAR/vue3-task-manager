<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import ThemeToggle from '@/features/theme-toggle/ThemeToggle.vue'

const route = useRoute()

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/kanban', label: 'Kanban', icon: '📋' },
  { to: '/projects', label: 'Projects', icon: '📁' },
]
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <nav class="app-sidebar">
      <div class="app-sidebar__brand">
        <span class="app-sidebar__logo">⚡</span>
        <span class="app-sidebar__name">ProjectHub</span>
      </div>

      <ul class="app-sidebar__nav">
        <li v-for="link in navLinks" :key="link.to">
          <RouterLink
            :to="link.to"
            class="app-sidebar__link"
            :class="{ 'app-sidebar__link--active': route.path.startsWith(link.to) }"
          >
            <span class="app-sidebar__link-icon">{{ link.icon }}</span>
            <span>{{ link.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Main content -->
    <div class="app-main">
      <header class="app-header">
        <div class="app-header__breadcrumb">
          {{ route.meta.title ?? 'Dashboard' }}
        </div>
        <div class="app-header__actions">
          <ThemeToggle />
        </div>
      </header>

      <main class="app-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/app/styles/global.scss';

.app-sidebar {
  &__brand {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid var(--color-border);
    font-weight: 700;
    font-size: 1rem;
    color: var(--color-text);
  }

  &__logo { font-size: 1.25rem; }

  &__nav {
    list-style: none;
    padding: 0.75rem 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.625rem 0.75rem;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s;
    text-decoration: none;

    &:hover { background: var(--color-surface-hover); color: var(--color-text); }

    &--active {
      background: var(--color-primary-light);
      color: var(--color-primary);
    }

    &-icon { font-size: 1rem; }
  }
}

.app-header {
  &__breadcrumb {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
  }

  &__actions { display: flex; align-items: center; gap: 0.5rem; }
}
</style>
