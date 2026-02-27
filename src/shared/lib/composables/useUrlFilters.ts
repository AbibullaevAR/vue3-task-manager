import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DEBOUNCE_DELAY } from '@/shared/config/constants'

type FieldType = 'string' | 'array' | 'number'

interface FieldConfig {
  type: FieldType
  default: string | string[] | number
  debounce?: number
}

type FiltersConfig = Record<string, FieldConfig>
type FiltersValue<C extends FiltersConfig> = {
  [K in keyof C]: C[K]['type'] extends 'array'
    ? string[]
    : C[K]['type'] extends 'number'
    ? number
    : string
}

/**
 * Sync filter state with URL query parameters.
 * Enables shareable filtered views.
 *
 * @example
 * const filters = useUrlFilters({
 *   status: { type: 'array', default: [] },
 *   search: { type: 'string', default: '', debounce: 300 },
 * })
 */
export function useUrlFilters<C extends FiltersConfig>(config: C) {
  const route = useRoute()
  const router = useRouter()

  // Debounce timers per field
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function parseQuery(key: string, fieldConfig: FieldConfig): FiltersValue<C>[string] {
    const raw = route.query[key]

    if (fieldConfig.type === 'array') {
      if (!raw) return (fieldConfig.default as string[]).slice() as FiltersValue<C>[string]
      return (Array.isArray(raw) ? raw : [raw]).filter(Boolean) as FiltersValue<C>[string]
    }

    if (fieldConfig.type === 'number') {
      const n = Number(raw)
      return (isNaN(n) ? fieldConfig.default : n) as FiltersValue<C>[string]
    }

    return ((raw ?? fieldConfig.default) as string) as FiltersValue<C>[string]
  }

  const filters = computed(() => {
    const result = {} as FiltersValue<C>
    for (const key in config) {
      result[key as keyof C] = parseQuery(key, config[key]) as FiltersValue<C>[keyof C]
    }
    return result
  })

  function setFilter<K extends keyof C>(key: K, value: FiltersValue<C>[K]): void {
    const fieldConfig = config[key as string]
    const delay = fieldConfig.debounce ?? (fieldConfig.type === 'string' ? DEBOUNCE_DELAY : 0)

    const apply = () => {
      const query = { ...route.query }
      const isEmpty = Array.isArray(value) ? value.length === 0 : value === fieldConfig.default
      if (isEmpty) {
        delete query[key as string]
      } else {
        query[key as string] = Array.isArray(value) ? value : String(value)
      }
      router.replace({ query })
    }

    if (delay > 0) {
      clearTimeout(timers.get(key as string))
      timers.set(key as string, setTimeout(apply, delay))
    } else {
      apply()
    }
  }

  function resetFilters(): void {
    router.replace({ query: {} })
  }

  const hasActiveFilters = computed(() => {
    for (const key in config) {
      const val = filters.value[key as keyof C]
      const def = config[key].default
      if (Array.isArray(val) ? val.length > 0 : val !== def) return true
    }
    return false
  })

  return { filters, setFilter, resetFilters, hasActiveFilters }
}
