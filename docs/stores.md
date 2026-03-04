# Pinia Stores

Все хранилища написаны в **Composition API стиле** (не Options API). Каждая сущность имеет свой store.

---

## Общая структура store

```typescript
// Шаблон для всех store
export const useXxxStore = defineStore('xxx', () => {
  // ── State ──────────────────────────────────────
  const items = shallowRef<Xxx[]>([])   // shallowRef для больших массивов!
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const rollbackStack = ref<Map<string, Xxx[]>>(new Map())

  // ── Getters (computed) ─────────────────────────
  const totalItems = computed(() => items.value.length)

  // ── Actions ────────────────────────────────────
  async function fetchItems(): Promise<void> { ... }
  async function createItem(payload: XxxCreatePayload): Promise<Xxx> { ... }
  async function updateItem(id: string, payload: XxxUpdatePayload): Promise<void> { ... }
  async function deleteItem(id: string): Promise<void> { ... }

  function $reset(): void {
    items.value = []
    isLoading.value = false
    error.value = null
    rollbackStack.value.clear()
  }

  return { items, isLoading, error, totalItems, fetchItems, createItem, updateItem, deleteItem, $reset }
})
```

---

## Task Store (`useTaskStore`)

**Файл:** `src/entities/task/model/task.store.ts`

### State

| Поле | Тип | Описание |
|---|---|---|
| `tasks` | `ShallowRef<Task[]>` | Массив всех задач. `shallowRef` для производительности |
| `isLoading` | `Ref<boolean>` | Флаг загрузки данных с API |
| `error` | `Ref<string \| null>` | Сообщение об ошибке или `null` |
| `rollbackStack` | `Ref<Map<string, Task[]>>` | Стек для отката оптимистичных обновлений |

### Getters

```typescript
// Задачи, сгруппированные по статусу и отсортированные по полю order
const tasksByStatus = computed((): Record<TaskStatus, Task[]> => {
  const result = { backlog: [], todo: [], in_progress: [], review: [], done: [] }
  for (const task of tasks.value) {
    result[task.status].push(task)
  }
  for (const status of Object.keys(result)) {
    result[status as TaskStatus].sort((a, b) => a.order - b.order)
  }
  return result
})

const totalTasks = computed(() => tasks.value.length)
const completedCount = computed(() => tasks.value.filter(t => t.status === 'done').length)
const completionRate = computed(() => totalTasks.value ? (completedCount.value / totalTasks.value) * 100 : 0)
const overdueCount = computed(() => tasks.value.filter(
  t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done'
).length)
```

### Actions

#### `fetchTasks(projectId?: string)`
Загружает задачи с API, опционально фильтрует по проекту.

```typescript
async function fetchTasks(projectId?: string): Promise<void> {
  isLoading.value = true
  error.value = null
  try {
    tasks.value = await taskApi.getTasks(projectId)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch tasks'
  } finally {
    isLoading.value = false
  }
}
```

#### `createTask(payload: TaskCreatePayload)`
Оптимистичное создание: добавляет временную задачу немедленно, откатывает при ошибке.

```typescript
async function createTask(payload: TaskCreatePayload): Promise<Task> {
  const rollbackId = crypto.randomUUID()
  const previousTasks = [...tasks.value]
  rollbackStack.value.set(rollbackId, previousTasks)

  // Оптимистичное добавление временной задачи
  const tempTask: Task = {
    id: `temp-${rollbackId}`,
    ...payload,
    // ... defaults
  }
  tasks.value = [...tasks.value, tempTask]

  try {
    const created = await taskApi.create(payload)
    // Заменяем временную задачу на реальную из API
    tasks.value = tasks.value.map(t => t.id === tempTask.id ? created : t)
    return created
  } catch (e) {
    // Откат: восстанавливаем предыдущее состояние
    tasks.value = previousTasks
    throw e
  } finally {
    rollbackStack.value.delete(rollbackId)
  }
}
```

#### `moveTask(taskId, fromStatus, toStatus, newIndex)`
Перемещение задачи между колонками или внутри колонки (для drag-drop).

```typescript
async function moveTask(
  taskId: string,
  fromStatus: string,
  toStatus: string,
  newIndex: number
): Promise<void> {
  // 1. Сохраняем снимок для отката
  const previousTasks = [...tasks.value]

  // 2. Оптимистично обновляем status + пересчитываем order
  tasks.value = tasks.value.map(t => {
    if (t.id === taskId) return { ...t, status: toStatus as TaskStatus, order: newIndex }
    // Сдвигаем порядок остальных задач в целевой колонке
    if (t.status === toStatus && t.order >= newIndex) return { ...t, order: t.order + 1 }
    return t
  })

  try {
    await taskApi.reorder(taskId, { status: toStatus as TaskStatus, order: newIndex })
  } catch {
    tasks.value = previousTasks  // Откат
  }
}
```

#### `getFilteredTasks(filters: TaskFilters)`
Синхронная фильтрация (не action — это обычная функция, возвращаемая из store).

```typescript
function getFilteredTasks(filters: TaskFilters): Task[] {
  return tasks.value.filter(task => {
    if (filters.status?.length && !filters.status.includes(task.status)) return false
    if (filters.priority?.length && !filters.priority.includes(task.priority)) return false
    if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false
    if (filters.projectId && task.projectId !== filters.projectId) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) return false
    }
    if (filters.tags?.length && !filters.tags.some(tag => task.tags.includes(tag))) return false
    return true
  })
}
```

---

## Project Store (`useProjectStore`)

**Файл:** `src/entities/project/model/project.store.ts`

### State

| Поле | Тип | Описание |
|---|---|---|
| `projects` | `ShallowRef<Project[]>` | Список проектов |
| `isLoading` | `Ref<boolean>` | Флаг загрузки |
| `error` | `Ref<string \| null>` | Ошибка |

### Getters

```typescript
const activeProjects = computed(() => projects.value.filter(p => p.status === 'active'))
const projectsById = computed(() => new Map(projects.value.map(p => [p.id, p])))
```

`projectsById` — Map для O(1) поиска проекта по id (используется при рендере карточек задач).

---

## User Store (`useUserStore`)

**Файл:** `src/entities/user/model/user.store.ts`

### State

| Поле | Тип | Описание |
|---|---|---|
| `users` | `ShallowRef<User[]>` | Список пользователей |
| `isLoading` | `Ref<boolean>` | Флаг загрузки |
| `error` | `Ref<string \| null>` | Ошибка |

### Getters

```typescript
const usersById = computed(() => new Map(users.value.map(u => [u.id, u])))
```

### Actions

```typescript
function getUserById(id: string): User | undefined {
  return usersById.value.get(id)
}
```

---

## Паттерн оптимистичных обновлений

Все мутирующие операции (`create`, `update`, `delete`, `move`) следуют одному паттерну:

```
1. Генерируем rollbackId = crypto.randomUUID()
2. Сохраняем previousState в rollbackStack
3. Немедленно обновляем UI (оптимистично)
4. Отправляем запрос к API
5. SUCCESS → очищаем rollbackStack
6. ERROR   → восстанавливаем previousState из rollbackStack
```

Это даёт **мгновенный отклик UI** при хорошем соединении и **корректный откат** при ошибках сети.

---

## Почему `shallowRef` вместо `ref`?

`ref()` создаёт **глубоко реактивный** объект — Vue отслеживает каждое свойство каждого элемента массива. При 1000+ задачах это создаёт тысячи отдельных реактивных dependency-объектов.

`shallowRef()` делает реактивным только **верхний уровень** (сам массив). При изменении — заменяем весь массив (`tasks.value = [...tasks.value, newTask]`), что тригерит только один dependency.

```typescript
// ❌ Медленно для больших коллекций
const tasks = ref<Task[]>([])
tasks.value.push(newTask)  // мутация работает, но дорого

// ✅ Быстро: shallow + immutable update
const tasks = shallowRef<Task[]>([])
tasks.value = [...tasks.value, newTask]  // замена массива — cheap
```

---

## Task Selectors

**Файл:** `src/entities/task/model/task.selectors.ts`

Дополнительные производные вычисления вынесены из store в отдельный composable:

```typescript
export function useTaskSelectors() {
  const store = useTaskStore()

  // Просроченные задачи
  const overdueTasks = computed(() =>
    store.tasks.filter(t => t.deadline && isPast(new Date(t.deadline)) && t.status !== 'done')
  )

  // Облако тегов: [{ tag: 'frontend', count: 5 }, ...]
  const tagCloud = computed(() => {
    const freq = new Map<string, number>()
    for (const task of store.tasks.value) {
      for (const tag of task.tags) {
        freq.set(tag, (freq.get(tag) ?? 0) + 1)
      }
    }
    return [...freq.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  })

  // Данные для burndown-графика: накопительное завершение по дням
  const burndownData = computed(() => { ... })

  return { overdueTasks, tagCloud, burndownData }
}
```
