# TypeScript типы

## Типы задач (Task Entity)

**Файл:** `src/entities/task/model/task.types.ts`

### Перечисления

```typescript
// Статусы задачи (порядок соответствует колонкам канбан-доски)
type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'

// Приоритеты (от низкого к высокому)
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
```

### Основной интерфейс

```typescript
interface Task {
  id: string               // UUID
  title: string            // Заголовок задачи
  description: string      // Описание (может быть пустым)
  status: TaskStatus
  priority: TaskPriority
  projectId: string        // Ссылка на Project.id
  assigneeId: string | null // Ссылка на User.id (null = не назначен)
  creatorId: string        // Ссылка на User.id (создатель)
  tags: string[]           // Массив тегов (строки в kebab-case)
  deadline: string | null  // ISO 8601 дата или null
  estimatedHours: number | null // Оценка трудозатрат в часах
  order: number            // Позиция в колонке (для сортировки)
  createdAt: string        // ISO 8601 timestamp
  updatedAt: string        // ISO 8601 timestamp
}
```

### Payload типы (для API)

```typescript
interface TaskCreatePayload {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeId?: string
  tags?: string[]
  deadline?: string
  estimatedHours?: number
}

// Все поля из TaskCreatePayload опциональны + order
interface TaskUpdatePayload extends Partial<TaskCreatePayload> {
  order?: number
}
```

### Фильтры

```typescript
interface TaskFilters {
  status?: TaskStatus[]      // Массив статусов (ИЛИ логика внутри, И с другими)
  priority?: TaskPriority[]  // Массив приоритетов
  assigneeId?: string        // Конкретный исполнитель
  projectId?: string         // Конкретный проект
  search?: string            // Поиск по title и description
  sortBy?: 'newest' | 'oldest' | 'priority' | 'deadline'
  tags?: string[]            // Хотя бы один тег совпадает
}
```

### Конфигурационные объекты

```typescript
// Конфиг для отображения статусов
const TASK_STATUS_CONFIG: Record<TaskStatus, {
  label: string   // Человекочитаемое название
  color: string   // CSS цвет для UI
  icon: string    // Иконка/эмодзи
}> = {
  backlog:     { label: 'Backlog',      color: '#94a3b8', icon: '📋' },
  todo:        { label: 'To Do',        color: '#3b82f6', icon: '📌' },
  in_progress: { label: 'In Progress',  color: '#f59e0b', icon: '🔄' },
  review:      { label: 'Review',       color: '#8b5cf6', icon: '👀' },
  done:        { label: 'Done',         color: '#10b981', icon: '✅' },
}

// Конфиг для отображения приоритетов
const TASK_PRIORITY_CONFIG: Record<TaskPriority, {
  label: string
  color: string
  weight: number  // Для сортировки (higher = more urgent)
}> = {
  low:      { label: 'Low',      color: '#94a3b8', weight: 1 },
  medium:   { label: 'Medium',   color: '#3b82f6', weight: 2 },
  high:     { label: 'High',     color: '#f59e0b', weight: 3 },
  critical: { label: 'Critical', color: '#ef4444', weight: 4 },
}
```

---

## Типы проектов (Project Entity)

**Файл:** `src/entities/project/model/project.types.ts`

```typescript
type ProjectStatus = 'active' | 'archived' | 'completed'

interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  color: string            // HEX цвет проекта (для UI)
  ownerId: string          // Ссылка на User.id
  memberIds: string[]      // Список участников
  taskCount: number        // Общее кол-во задач
  completedTaskCount: number // Завершённые задачи
  deadline: string | null
  createdAt: string
  updatedAt: string
}

interface ProjectCreatePayload {
  name: string
  description: string
  status: ProjectStatus
  color: string
  memberIds?: string[]
  deadline?: string
}

interface ProjectUpdatePayload extends Partial<ProjectCreatePayload> {}
```

---

## Типы пользователей (User Entity)

**Файл:** `src/entities/user/model/user.types.ts`

```typescript
type UserRole = 'admin' | 'member' | 'viewer'

interface User {
  id: string
  name: string
  email: string
  avatar: string | null    // URL аватара или null → показываем инициалы
  role: UserRole
  createdAt: string
}
```

---

## Общие типы (Shared)

**Файл:** `src/shared/types/index.ts`

```typescript
// Стандартный формат ошибки от API
interface ApiError {
  message: string
  code?: string      // Машиночитаемый код ошибки
  status?: number    // HTTP статус
}

// Пагинированный ответ API (для будущих списков)
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// Тема приложения
type Theme = 'light' | 'dark'
```

---

## Типы для composables

### useDragDrop

```typescript
interface DragDropOptions<T extends { id: string }> {
  onReorder: (itemId: string, fromColumn: string, toColumn: string, newIndex: number) => void
  onDragStart?: (item: T) => void
  onDragEnd?: () => void
  dragImageClass?: string
}

interface DragState {
  isDragging: boolean
  draggedItemId: string | null
  sourceColumn: string | null
  overColumn: string | null
  overIndex: number
}
```

### useVirtualScroll

```typescript
interface VirtualScrollOptions {
  itemHeight: number   // Фиксированная высота элемента (px)
  overscan?: number    // Кол-во элементов вне viewport (default: 3)
}

interface VirtualScrollReturn<T> {
  visibleItems: ComputedRef<Array<{ item: T; index: number }>>
  containerRef: Ref<HTMLElement | null>
  totalHeight: ComputedRef<number>
  scrollToIndex: (index: number) => void
}
```

---

## Конфигурация TypeScript

**Файл:** `tsconfig.app.json`

Ключевые опции `strict` mode:

```json
{
  "compilerOptions": {
    "strict": true,                    // Включает все strict-проверки
    "noUnusedLocals": true,            // Ошибка на неиспользуемые переменные
    "noUnusedParameters": true,        // Ошибка на неиспользуемые параметры
    "noFallthroughCasesInSwitch": true, // Ошибка при пропуске break в switch
    "moduleResolution": "bundler",     // Современный резолвинг (без .js в импортах)
    "paths": {
      "@/*": ["./src/*"]              // Алиас для импортов
    }
  }
}
```

**Важно:** `allowImportingTsExtensions: true` + `noEmit: true` — TypeScript только проверяет типы, компилирует Vite.
