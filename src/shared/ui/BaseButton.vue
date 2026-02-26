<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :class="[
      'btn',
      `btn--${variant ?? 'primary'}`,
      `btn--${size ?? 'md'}`,
      { 'btn--loading': loading },
    ]"
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, opacity 0.15s, border-color 0.15s;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--sm { padding: 0.25rem 0.625rem; font-size: 0.75rem; }
  &--md { padding: 0.5rem 1rem; font-size: 0.875rem; }
  &--lg { padding: 0.75rem 1.5rem; font-size: 1rem; }

  &--primary {
    background: var(--color-primary);
    color: #fff;
    &:hover:not(:disabled) { background: var(--color-primary-hover); }
  }

  &--secondary {
    background: var(--color-surface-raised);
    color: var(--color-text);
    border-color: var(--color-border);
    &:hover:not(:disabled) { background: var(--color-surface-hover); }
  }

  &--danger {
    background: var(--color-danger);
    color: #fff;
    &:hover:not(:disabled) { opacity: 0.85; }
  }

  &--ghost {
    background: transparent;
    color: var(--color-text-secondary);
    &:hover:not(:disabled) { background: var(--color-surface-hover); color: var(--color-text); }
  }

  &__spinner {
    width: 0.875em;
    height: 0.875em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
