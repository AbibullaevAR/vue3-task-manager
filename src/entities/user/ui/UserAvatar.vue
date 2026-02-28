<script setup lang="ts">
import type { User } from '../model/user.types'

const props = defineProps<{
  user?: User | null
  size?: 'sm' | 'md' | 'lg'
}>()

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

// Generate a consistent color from the user's name
function avatarColor(name: string): string {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444']
  let hash = 0
  for (const ch of name) hash = (hash << 5) - hash + ch.charCodeAt(0)
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div
    class="avatar"
    :class="`avatar--${size ?? 'md'}`"
    :style="user ? { backgroundColor: avatarColor(user.name) } : undefined"
    :title="user?.name"
  >
    <img v-if="user?.avatar" :src="user.avatar" :alt="user.name" class="avatar__img" />
    <span v-else-if="user" class="avatar__initials">{{ initials(user.name) }}</span>
    <span v-else class="avatar__placeholder">?</span>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--color-surface-raised);
  color: #fff;
  font-weight: 600;
  overflow: hidden;

  &--sm { width: 24px; height: 24px; font-size: 0.625rem; }
  &--md { width: 32px; height: 32px; font-size: 0.75rem; }
  &--lg { width: 40px; height: 40px; font-size: 0.875rem; }

  &__img { width: 100%; height: 100%; object-fit: cover; }
  &__placeholder { color: var(--color-text-secondary); }
}
</style>
