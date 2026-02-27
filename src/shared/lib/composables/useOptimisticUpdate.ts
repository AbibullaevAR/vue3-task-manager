import { ref } from 'vue'

interface OptimisticUpdateOptions<T, P> {
  /** Apply optimistic change to local state */
  optimistic: (payload: P) => T
  /** Actual API request */
  request: (payload: P) => Promise<T>
  /** Rollback function called with the state snapshot before the update */
  rollback: (previousState: T) => void
  /** Optional error handler */
  onError?: (error: Error) => void
}

/**
 * Generic composable for the optimistic update pattern.
 * Updates UI immediately, then syncs with the server.
 * On failure, rolls back to the previous state.
 *
 * @example
 * const { execute, isLoading } = useOptimisticUpdate({
 *   optimistic: (task) => taskStore.updateLocal(task),
 *   request: (task) => taskApi.update(task.id, task),
 *   rollback: (prev) => taskStore.setLocal(prev),
 *   onError: (err) => console.error(err),
 * })
 * await execute(updatedTask)
 */
export function useOptimisticUpdate<T, P>(options: OptimisticUpdateOptions<T, P>) {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function execute(payload: P): Promise<T | undefined> {
    isLoading.value = true
    error.value = null

    const previousState = options.optimistic(payload)

    try {
      const result = await options.request(payload)
      return result
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err))
      error.value = e
      options.rollback(previousState)
      options.onError?.(e)
      return undefined
    } finally {
      isLoading.value = false
    }
  }

  return { execute, isLoading, error }
}
