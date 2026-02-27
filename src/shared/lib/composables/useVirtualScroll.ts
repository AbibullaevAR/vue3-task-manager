import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'

interface VirtualScrollOptions {
  /** Fixed height of each item in pixels */
  itemHeight: number
  /** Number of extra items to render above and below the viewport */
  overscan?: number
}

interface VirtualScrollReturn<T> {
  /** Items currently visible in the viewport (+ overscan) */
  visibleItems: ComputedRef<Array<{ item: T; index: number; style: Record<string, string> }>>
  /** Props to spread on the scroll container */
  containerRef: Ref<HTMLElement | undefined>
  /** Total height of the virtual content */
  totalHeight: ComputedRef<number>
  /** Scroll to a specific item index */
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void
}

/**
 * Virtual scroll composable for rendering large lists efficiently.
 * Only renders items visible in the viewport (+ overscan buffer).
 * Handles 10,000+ items at 60fps.
 *
 * @example
 * ```vue
 * <script setup>
 * const { visibleItems, containerRef, totalHeight } = useVirtualScroll(tasks, {
 *   itemHeight: 72,
 *   overscan: 5,
 * })
 * </script>
 *
 * <template>
 *   <div ref="containerRef" class="scroll-container" style="overflow-y: auto; height: 600px;">
 *     <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
 *       <div
 *         v-for="{ item, index, style } in visibleItems"
 *         :key="item.id"
 *         :style="style"
 *       >
 *         <TaskCard :task="item" />
 *       </div>
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export function useVirtualScroll<T>(
  items: Ref<T[]>,
  options: VirtualScrollOptions,
): VirtualScrollReturn<T> {
  const { itemHeight, overscan = 3 } = options

  const containerRef = ref<HTMLElement>()
  const scrollTop = ref(0)
  const containerHeight = ref(0)

  // Total scrollable height
  const totalHeight = computed(() => items.value.length * itemHeight)

  // Calculate visible range
  const startIndex = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight) - overscan
    return Math.max(0, start)
  })

  const endIndex = computed(() => {
    const visibleCount = Math.ceil(containerHeight.value / itemHeight)
    const end = startIndex.value + visibleCount + overscan * 2
    return Math.min(items.value.length, end)
  })

  // Visible items with positioning
  const visibleItems = computed(() => {
    const result: Array<{ item: T; index: number; style: Record<string, string> }> = []

    for (let i = startIndex.value; i < endIndex.value; i++) {
      if (i >= items.value.length) break

      result.push({
        item: items.value[i],
        index: i,
        style: {
          position: 'absolute',
          top: `${i * itemHeight}px`,
          left: '0',
          right: '0',
          height: `${itemHeight}px`,
        },
      })
    }

    return result
  })

  // Scroll handler with rAF throttle
  let rafId: number | null = null

  const handleScroll = () => {
    if (rafId !== null) return

    rafId = requestAnimationFrame(() => {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop
      }
      rafId = null
    })
  }

  const scrollToIndex = (index: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.value) return

    const targetTop = index * itemHeight
    containerRef.value.scrollTo({ top: targetTop, behavior })
  }

  // Resize observer for container height changes
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (!containerRef.value) return

    containerHeight.value = containerRef.value.clientHeight
    containerRef.value.addEventListener('scroll', handleScroll, { passive: true })

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerHeight.value = entry.contentRect.height
      }
    })
    resizeObserver.observe(containerRef.value)
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
    resizeObserver?.disconnect()
  })

  return {
    visibleItems,
    containerRef,
    totalHeight,
    scrollToIndex,
  }
}
