<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

onMounted(() => {
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDark.value = stored ? stored === 'dark' : prefersDark
  applyTheme(isDark.value)
})

watch(isDark, applyTheme)
</script>

<template>
  <button
    class="theme-toggle"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="isDark = !isDark"
  >
    <span class="theme-toggle__icon">{{ isDark ? '☀️' : '🌙' }}</span>
  </button>
</template>

<style lang="scss" scoped>
.theme-toggle {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.375rem 0.625rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: background-color 0.15s;

  &:hover { background: var(--color-surface-hover); }
  &__icon { display: block; }
}
</style>
