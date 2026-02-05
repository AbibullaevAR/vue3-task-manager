<script setup lang="ts">
defineProps<{
  color?: string
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span
    class="badge"
    :class="`badge--${size ?? 'md'}`"
    :style="color ? { backgroundColor: `${color}22`, color } : undefined"
  >
    <slot />
  </span>
</template>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: var(--radius-full);
  font-weight: 500;
  background: var(--color-surface-raised);
  color: var(--color-text-secondary);

  &--sm { padding: 0.125rem 0.5rem; font-size: 0.6875rem; }
  &--md { padding: 0.25rem 0.625rem; font-size: 0.75rem; }
}
</style>
