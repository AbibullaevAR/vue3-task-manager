# Composables

Все composables находятся в `src/shared/lib/composables/`. Они **generic** и не зависят от конкретных бизнес-сущностей.

---

## `useDragDrop<T>`

**Файл:** `src/shared/lib/composables/useDragDrop.ts`
**Re-export:** `src/features/drag-drop/index.ts`

Реализует Drag & Drop для Kanban-колонок через нативный HTML5 DnD API с поддержкой клавиатуры.

### Интерфейсы

```typescript
export interface DragDropOptions<T extends { id: string }> {
  // Вызывается при успешном drop
  onReorder: (itemId: string, fromColumn: string, toColumn: string, newIndex: number) => void
  // Опциональные колбэки
  onDragStart?: (item: T) => void
  onDragEnd?: () => void
  // CSS-класс для кастомного drag image
  dragImageClass?: string
}

export interface DragState {
  isDragging: boolean
  draggedItemId: string | null
  sourceColumn: string | null
  overColumn: string | null
  overIndex: number          // Индекс позиции при наведении
}
```

### Использование

```typescript
const { dragState, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragDrop<Task>({
  onReorder: (itemId, fromCol, toCol, newIndex) => {
    taskStore.moveTask(itemId, fromCol, toCol, newIndex)
  },
})
```

```html
<!-- Draggable item -->
<div
  draggable="true"
  @dragstart="handleDragStart($event, task, columnId)"
  @dragend="handleDragEnd"
>
  <TaskCard :task="task" />
</div>

<!-- Drop zone (column) -->
<div
  @dragover.prevent="handleDragOver($event, columnId)"
  @dragenter="handleDragEnter(columnId)"
  @dragleave="handleDragLeave"
  @drop="handleDrop($event, columnId)"
>
```

### Как работает

1. `handleDragStart` — сохраняет перетаскиваемый элемент в замыкании, обновляет `dragState`.
2. `handleDragOver` — вычисляет `overIndex` по позиции курсора относительно дочерних элементов колонки.
3. `handleDrop` — вызывает `options.onReorder(itemId, fromCol, toCol, newIndex)`.
4. `handleDragEnd` — сбрасывает `dragState` в исходное состояние.

### Клавиатурная доступность

```typescript
// handleKeyboardMove — перемещение через стрелки + Enter
// ArrowLeft/ArrowRight — между колонками
// ArrowUp/ArrowDown   — внутри колонки
// Enter               — подтвердить перемещение
```

### `dragState` — реактивное состояние

Возвращается как `readonly`, чтобы компоненты не мутировали его напрямую:

```typescript
const dragState = readonly(state)  // DragState
```

Используется в шаблоне для визуальной обратной связи:

```html
<div
  :class="{
    'column--drag-over': dragState.overColumn === column,
    'column--over-limit': tasks.length > WIP_LIMITS[column]
  }"
>
```

---

## `useVirtualScroll<T>`

**Файл:** `src/shared/lib/composables/useVirtualScroll.ts`

Эффективный рендеринг больших списков — отображает только видимые элементы + `overscan`.

### Интерфейс

```typescript
interface VirtualScrollOptions {
  itemHeight: number    // Высота одного элемента в пикселях (фиксированная)
  overscan?: number     // Количество дополнительных элементов вне viewport (default: 3)
}

interface VirtualScrollReturn<T> {
  visibleItems: ComputedRef<{ item: T; index: number }[]>
  containerRef: Ref<HTMLElement | null>  // Привяжи к scroll-контейнеру
  totalHeight: ComputedRef<number>       // Полная высота списка (для placeholder)
  scrollToIndex: (index: number) => void
}
```

### Использование

```typescript
const { visibleItems, containerRef, totalHeight } = useVirtualScroll(tasks, {
  itemHeight: 80,
  overscan: 5,
})
```

```html
<div ref="containerRef" style="overflow-y: auto; height: 400px;">
  <!-- Placeholder для сохранения скролла -->
  <div :style="{ height: totalHeight + 'px', position: 'relative' }">
    <div
      v-for="{ item, index } in visibleItems"
      :key="item.id"
      :style="{ position: 'absolute', top: index * 80 + 'px', width: '100%' }"
    >
      <TaskCard :task="item" />
    </div>
  </div>
</div>
```

### Как работает

- Вычисляет `startIndex` и `endIndex` видимых элементов по `scrollTop` и `containerHeight`.
- Расширяет диапазон на `overscan` с каждой стороны.
- Слушает `scroll` через `requestAnimationFrame` (предотвращает layout thrashing).
- Использует `ResizeObserver` для обновления при изменении размера контейнера.

**Производительность**: отображает ~15 элементов вместо 10 000, при этом скроллинг остаётся плавным.

---

## `useUrlFilters<C>`

**Файл:** `src/shared/lib/composables/useUrlFilters.ts`

Синхронизирует состояние фильтров с URL query-параметрами. Позволяет делиться ссылками с активными фильтрами.

### Конфигурация

```typescript
type FieldType = 'string' | 'number' | 'array'

interface FieldConfig {
  type: FieldType
  default: unknown
  debounce?: number  // задержка в мс перед записью в URL
}

type FiltersConfig = Record<string, FieldConfig>
```

### Использование

```typescript
const { filters, setFilter, resetFilters, hasActiveFilters } = useUrlFilters({
  search: { type: 'string', default: '', debounce: 300 },
  status: { type: 'array', default: [] },
  priority: { type: 'array', default: [] },
  assigneeId: { type: 'string', default: '' },
})
```

```html
<input :value="filters.search" @input="setFilter('search', $event.target.value)" />
<button v-if="hasActiveFilters" @click="resetFilters">Сбросить</button>
```

### URL пример

```
/kanban?search=bug&status=todo,in_progress&priority=high
```

### Как работает

- При монтировании читает начальные значения из `route.query`.
- `setFilter` обновляет реактивный объект `filters` и обновляет URL через `router.replace`.
- Поля с `debounce` записываются в URL с задержкой (чтобы не писать каждый символ поиска).
- `hasActiveFilters` — `computed`, сравнивает текущие значения с `default`.

---

## `useOptimisticUpdate<T, P>`

**Файл:** `src/shared/lib/composables/useOptimisticUpdate.ts`

Generic composable для применения оптимистичных обновлений. Инкапсулирует паттерн: применить → запросить → откатить при ошибке.

### Интерфейс

```typescript
interface OptimisticUpdateOptions<T, P> {
  optimistic: (payload: P) => T         // Вычислить новое состояние
  request: (payload: P) => Promise<T>   // API вызов
  rollback: (previousState: T) => void  // Восстановить при ошибке
  onError?: (error: Error) => void      // Опциональная обработка ошибки
}

interface OptimisticUpdateReturn<P> {
  execute: (payload: P) => Promise<void>
  isLoading: Ref<boolean>
  error: Ref<string | null>
}
```

### Использование

```typescript
const { execute, isLoading, error } = useOptimisticUpdate({
  optimistic: (payload) => ({ ...currentItem.value, ...payload }),
  request: (payload) => taskApi.update(taskId, payload),
  rollback: (previous) => { currentItem.value = previous },
  onError: (e) => console.error(e),
})

// В обработчике события
await execute({ title: 'New title', priority: 'high' })
```

### Примечание

В task store паттерн реализован инлайн (не через этот composable) для большего контроля. Этот composable предназначен для компонентов, которым нужна локальная оптимистичная логика.
