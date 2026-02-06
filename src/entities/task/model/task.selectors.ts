import { computed } from 'vue'
import { useTaskStore } from './task.store'
import { isPast } from '@/shared/lib/helpers/date'

/**
 * Derived state selectors for the task entity.
 * Keeps expensive computations out of the store and co-located with consumers.
 */
export function useTaskSelectors() {
  const store = useTaskStore()

  const tasksByStatus = computed(() => store.tasksByStatus)

  const overdueTasks = computed(() =>
    store.tasks.filter(
      (t) => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'done',
    ),
  )

  const burndownData = computed(() => {
    const total = store.tasks.length
    if (!total) return { labels: [], ideal: [], actual: [] }

    // Group done tasks by date to build cumulative burndown
    const doneTasks = store.tasks
      .filter((t) => t.status === 'done')
      .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))

    const labels: string[] = []
    const actual: number[] = []
    let remaining = total

    for (const task of doneTasks) {
      labels.push(task.updatedAt.slice(0, 10))
      remaining--
      actual.push(remaining)
    }

    return { labels, actual, total }
  })

  const tagCloud = computed(() => {
    const counts = new Map<string, number>()
    for (const task of store.tasks) {
      for (const tag of task.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))
  })

  return { tasksByStatus, overdueTasks, burndownData, tagCloud }
}
