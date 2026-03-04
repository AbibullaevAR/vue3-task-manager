# API слой

## Обзор

Проект использует нативный `fetch` API для HTTP запросов. Базовый URL задаётся через переменную окружения `VITE_API_BASE` (по умолчанию `/api`).

В dev-режиме mock API реализован прямо в `vite.config.ts` как Vite middleware — никакого отдельного бэкенда не нужно.

---

## HTTP Client

**Файл:** `src/shared/api/http-client.ts`

```typescript
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,  // HTTP статус код
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new HttpError(
      `HTTP error ${response.status}: ${response.statusText}`,
      response.status,
    )
  }

  // 204 No Content → возвращаем undefined
  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}
```

**Особенности:**
- Автоматически добавляет `Content-Type: application/json`.
- Для успешных не-204 ответов — парсит JSON.
- Для 204 — возвращает `undefined`.
- Для `!response.ok` — бросает `HttpError` со статус-кодом.

---

## Task API

**Файл:** `src/entities/task/api/task.api.ts`

```typescript
export const taskApi = {
  // GET /api/tasks?projectId=xxx
  async getTasks(projectId?: string): Promise<Task[]>,

  // GET /api/tasks/:id
  async getTaskById(id: string): Promise<Task>,

  // POST /api/tasks
  async create(payload: TaskCreatePayload): Promise<Task>,

  // PATCH /api/tasks/:id
  async update(id: string, payload: TaskUpdatePayload): Promise<Task>,

  // PATCH /api/tasks/:id/reorder
  async reorder(id: string, payload: { status: TaskStatus; order: number }): Promise<void>,

  // DELETE /api/tasks/:id
  async delete(id: string): Promise<void>,
}
```

### Эндпоинты

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/tasks` | Список задач (query: `projectId`) |
| `GET` | `/api/tasks/:id` | Задача по ID |
| `POST` | `/api/tasks` | Создать задачу |
| `PATCH` | `/api/tasks/:id` | Обновить задачу |
| `PATCH` | `/api/tasks/:id/reorder` | Изменить порядок/статус |
| `DELETE` | `/api/tasks/:id` | Удалить задачу |

---

## Project API

**Файл:** `src/entities/project/api/project.api.ts`

```typescript
export const projectApi = {
  // GET /api/projects
  async getProjects(): Promise<Project[]>,

  // GET /api/projects/:id
  async getProjectById(id: string): Promise<Project>,

  // POST /api/projects
  async create(payload: ProjectCreatePayload): Promise<Project>,

  // PATCH /api/projects/:id
  async update(id: string, payload: ProjectUpdatePayload): Promise<Project>,

  // DELETE /api/projects/:id
  async delete(id: string): Promise<void>,
}
```

### Эндпоинты

| Метод | URL | Описание |
|---|---|---|
| `GET` | `/api/projects` | Список проектов |
| `GET` | `/api/projects/:id` | Проект по ID |
| `POST` | `/api/projects` | Создать проект |
| `PATCH` | `/api/projects/:id` | Обновить проект |
| `DELETE` | `/api/projects/:id` | Удалить проект |

---

## User API

**Файл:** `src/entities/user/api/user.api.ts`

```typescript
export const userApi = {
  // GET /api/users
  async getUsers(): Promise<User[]>,

  // GET /api/users/:id
  async getUserById(id: string): Promise<User>,
}
```

---

## Mock API (Dev Server)

**Файл:** `vite.config.ts` — секция `configureServer`

В dev-режиме Vite middleware перехватывает все запросы на `/api/*` и возвращает mock-данные из памяти. Это позволяет разрабатывать полностью без бэкенда.

### Структура mock данных

```typescript
// In-memory база данных
const mockDb = {
  tasks: Task[],     // ~10-15 задач
  projects: Project[], // ~3-4 проекта
  users: User[],     // ~4-5 пользователей
}
```

### Поддерживаемые операции

Mock API полностью имитирует поведение реального API:

```
GET    /api/tasks              → mockDb.tasks (с фильтрацией по projectId)
POST   /api/tasks              → создаёт новую задачу (UUID + timestamps)
PATCH  /api/tasks/:id          → обновляет задачу
PATCH  /api/tasks/:id/reorder  → обновляет status + order
DELETE /api/tasks/:id          → удаляет задачу

GET    /api/projects           → mockDb.projects
POST   /api/projects           → создаёт проект
PATCH  /api/projects/:id       → обновляет проект
DELETE /api/projects/:id       → удаляет проект

GET    /api/users              → mockDb.users
GET    /api/users/:id          → пользователь по id
```

### Как переключиться на реальный API

1. Задать `VITE_API_BASE` в `.env.local`:
   ```
   VITE_API_BASE=https://your-api.com/api
   ```
2. Mock middleware в Vite не будет активен в production (он только в `configureServer`).
3. Убедиться что реальный API возвращает те же TypeScript-типы.

---

## Обработка ошибок в компонентах

Store хранит ошибку в `error` ref. Компоненты отображают её:

```vue
<template>
  <div v-if="taskStore.error" class="error-state">
    <p>{{ taskStore.error }}</p>
    <BaseButton @click="taskStore.fetchTasks()">Повторить</BaseButton>
  </div>
  <div v-else-if="taskStore.isLoading" class="loading-state">
    Загрузка...
  </div>
  <TaskBoard v-else :tasks="tasks" />
</template>
```

---

## TypeScript типы для API

### TaskCreatePayload

```typescript
interface TaskCreatePayload {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeId?: string
  tags?: string[]
  deadline?: string    // ISO 8601
  estimatedHours?: number
}
```

### TaskUpdatePayload

```typescript
interface TaskUpdatePayload extends Partial<TaskCreatePayload> {
  order?: number
}
```

### ApiError (shared type)

```typescript
interface ApiError {
  message: string
  code?: string
  status?: number
}
```
