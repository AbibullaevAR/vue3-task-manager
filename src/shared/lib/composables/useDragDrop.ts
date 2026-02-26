import { ref, readonly, type Ref } from 'vue'

export interface DragDropOptions<T extends { id: string }> {
  /** Called when an item is successfully dropped in a new position */
  onReorder: (itemId: string, fromColumn: string, toColumn: string, newIndex: number) => void
  /** Called when drag starts */
  onDragStart?: (item: T) => void
  /** Called when drag ends (regardless of success) */
  onDragEnd?: () => void
  /** Custom drag image element class */
  dragImageClass?: string
}

export interface DragState {
  isDragging: boolean
  draggedItemId: string | null
  sourceColumn: string | null
  overColumn: string | null
  overIndex: number
}

/**
 * Generic drag & drop composable using native HTML5 DnD API.
 * Supports keyboard accessibility (Arrow keys + Enter).
 * No external dependencies required.
 *
 * @example
 * ```vue
 * <script setup>
 * const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
 *   useDragDrop<Task>({
 *     onReorder: (id, from, to, index) => store.moveTask(id, from, to, index),
 *   })
 * </script>
 *
 * <template>
 *   <div
 *     v-for="task in tasks"
 *     :key="task.id"
 *     draggable="true"
 *     :class="{ 'is-dragging': dragState.draggedItemId === task.id }"
 *     @dragstart="handleDragStart($event, task, 'todo')"
 *     @dragend="handleDragEnd"
 *   >
 *     {{ task.title }}
 *   </div>
 * </template>
 * ```
 */
export function useDragDrop<T extends { id: string }>(
  options: DragDropOptions<T>,
) {
  const state = ref<DragState>({
    isDragging: false,
    draggedItemId: null,
    sourceColumn: null,
    overColumn: null,
    overIndex: -1,
  })

  // Store the dragged item reference
  let draggedItem: T | null = null

  function handleDragStart(event: DragEvent, item: T, columnId: string): void {
    if (!event.dataTransfer) return

    draggedItem = item

    state.value = {
      isDragging: true,
      draggedItemId: item.id,
      sourceColumn: columnId,
      overColumn: null,
      overIndex: -1,
    }

    // Configure drag data and effect
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)

    // Create custom drag image
    if (options.dragImageClass) {
      const dragImage = (event.target as HTMLElement).cloneNode(true) as HTMLElement
      dragImage.classList.add(options.dragImageClass)
      document.body.appendChild(dragImage)
      event.dataTransfer.setDragImage(dragImage, 0, 0)
      requestAnimationFrame(() => document.body.removeChild(dragImage))
    }

    // Slightly delay to allow browser to capture drag image
    requestAnimationFrame(() => {
      const target = event.target as HTMLElement
      target.style.opacity = '0.4'
    })

    options.onDragStart?.(item)
  }

  function handleDragOver(event: DragEvent, columnId: string, index: number): void {
    event.preventDefault()
    if (!event.dataTransfer) return

    event.dataTransfer.dropEffect = 'move'

    state.value.overColumn = columnId
    state.value.overIndex = index
  }

  function handleDragEnter(event: DragEvent, columnId: string): void {
    event.preventDefault()
    state.value.overColumn = columnId
  }

  function handleDragLeave(event: DragEvent, columnId: string): void {
    // Only update if we're actually leaving the column (not entering a child)
    const relatedTarget = event.relatedTarget as HTMLElement | null
    const currentTarget = event.currentTarget as HTMLElement

    if (relatedTarget && currentTarget.contains(relatedTarget)) return

    if (state.value.overColumn === columnId) {
      state.value.overColumn = null
      state.value.overIndex = -1
    }
  }

  function handleDrop(event: DragEvent, columnId: string, index: number): void {
    event.preventDefault()

    const { draggedItemId, sourceColumn } = state.value

    if (!draggedItemId || !sourceColumn) return

    // Don't reorder if dropped in same position
    if (sourceColumn === columnId && state.value.overIndex === index) {
      resetState()
      return
    }

    options.onReorder(draggedItemId, sourceColumn, columnId, index)
    resetState()
  }

  function handleDragEnd(event: DragEvent): void {
    // Restore opacity
    const target = event.target as HTMLElement
    target.style.opacity = ''

    resetState()
    options.onDragEnd?.()
  }

  /**
   * Keyboard-accessible alternative to drag & drop.
   * Use Arrow keys to select direction, Enter to confirm move.
   */
  function handleKeyboardMove(
    item: T,
    currentColumn: string,
    direction: 'left' | 'right' | 'up' | 'down',
    columns: string[],
    getColumnItems: (columnId: string) => T[],
  ): void {
    const currentColumnIndex = columns.indexOf(currentColumn)
    const currentItems = getColumnItems(currentColumn)
    const currentItemIndex = currentItems.findIndex((t) => t.id === item.id)

    if (direction === 'left' || direction === 'right') {
      const targetColumnIndex = direction === 'left'
        ? Math.max(0, currentColumnIndex - 1)
        : Math.min(columns.length - 1, currentColumnIndex + 1)

      if (targetColumnIndex === currentColumnIndex) return

      const targetColumn = columns[targetColumnIndex]
      const targetItems = getColumnItems(targetColumn)

      options.onReorder(item.id, currentColumn, targetColumn, targetItems.length)
    } else {
      const newIndex = direction === 'up'
        ? Math.max(0, currentItemIndex - 1)
        : Math.min(currentItems.length - 1, currentItemIndex + 1)

      if (newIndex === currentItemIndex) return

      options.onReorder(item.id, currentColumn, currentColumn, newIndex)
    }
  }

  function resetState(): void {
    state.value = {
      isDragging: false,
      draggedItemId: null,
      sourceColumn: null,
      overColumn: null,
      overIndex: -1,
    }
    draggedItem = null
  }

  return {
    dragState: readonly(state) as Readonly<Ref<DragState>>,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    handleKeyboardMove,
  }
}
