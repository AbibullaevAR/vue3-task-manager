# Тестирование

## Обзор

| Вид | Инструмент | Директория | Команда |
|---|---|---|---|
| Unit тесты | Vitest + @vue/test-utils | `tests/unit/` | `pnpm test` |
| E2E тесты | Playwright | `tests/e2e/` | `pnpm test:e2e` |
| Покрытие | @vitest/coverage-v8 | — | `pnpm test:coverage` |

**Порог покрытия (CI):** 85% statements, 80% branches, 85% functions, 85% lines.

---

## Unit тесты (Vitest)

### Конфигурация

Настроена в `vite.config.ts` секция `test`:

```typescript
test: {
  environment: 'happy-dom',  // Лёгкий DOM без Node.js overhead
  globals: true,             // describe/it/expect без импортов
  alias: {
    '@/': path.resolve(__dirname, 'src/') + '/',  // Алиас @/ для тестов
  },
  coverage: {
    provider: 'v8',
    thresholds: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
}
```

### Структура тестового файла

```
tests/unit/
└── task.store.spec.ts  // 268 строк, 20 тестов
```

### Паттерны тестирования

#### 1. Мокирование API модуля

```typescript
// Мокируем весь модуль task.api
vi.mock('@/entities/task/api/task.api', () => ({
  taskApi: {
    getTasks: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
  },
}))

// Получаем типизированный мок
import { taskApi } from '@/entities/task/api/task.api'
const mockTaskApi = vi.mocked(taskApi)
```

#### 2. Настройка Pinia для тестов

```typescript
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())  // Свежий store перед каждым тестом
})
```

#### 3. Фабрика тестовых данных

```typescript
function mockTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Test Task',
    description: '',
    status: 'todo',
    priority: 'medium',
    projectId: 'proj-1',
    assigneeId: null,
    creatorId: 'user-1',
    tags: ['frontend'],   // ВАЖНО: дефолт 'frontend', переопределяй при нужде
    deadline: null,
    estimatedHours: null,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}
```

#### 4. Тест оптимистичного обновления

```typescript
it('rolls back on createTask API failure', async () => {
  const store = useTaskStore()
  store.tasks = [mockTask({ id: 'existing' })]

  // Мокируем ошибку API
  mockTaskApi.create.mockRejectedValueOnce(new Error('Network error'))

  await expect(store.createTask({ title: 'New', ... })).rejects.toThrow()

  // Проверяем откат — только исходная задача
  expect(store.tasks.length).toBe(1)
  expect(store.tasks[0].id).toBe('existing')
})
```

### Описание тестов (task.store.spec.ts)

#### `describe('initial state')`
- ✅ Начальный state: пустой массив, loading=false, error=null

#### `describe('tasksByStatus getter')`
- ✅ Группирует задачи по статусу
- ✅ Сортирует по полю `order`
- ✅ Пустые колонки — пустые массивы

#### `describe('completion rate')`
- ✅ 0% при нет задач
- ✅ Правильный расчёт процента
- ✅ 100% при все done

#### `describe('overdueCount')`
- ✅ Считает только задачи с deadline в прошлом
- ✅ Не считает done-задачи
- ✅ Не считает без deadline

#### `describe('getFilteredTasks')`
- ✅ Фильтр по статусу (один)
- ✅ Фильтр по нескольким статусам
- ✅ Фильтр по приоритету
- ✅ Фильтр по assigneeId
- ✅ Фильтр по тегам (хотя бы один совпадает)
- ✅ Поиск по title
- ✅ Поиск по description
- ✅ Комбинация фильтров (AND логика)

#### `describe('fetchTasks')`
- ✅ Загружает задачи из API
- ✅ Устанавливает isLoading → false после загрузки
- ✅ Устанавливает error при ошибке API

#### `describe('createTask')`
- ✅ Оптимистично добавляет задачу до ответа API
- ✅ Заменяет временную задачу на созданную с сервера
- ✅ Откатывает при ошибке API

#### `describe('deleteTask')`
- ✅ Оптимистично удаляет задачу
- ✅ Восстанавливает при ошибке API

#### `describe('$reset')`
- ✅ Сбрасывает весь state в начальное состояние

### Запуск отдельного тестового файла

```bash
pnpm vitest run tests/unit/task.store.spec.ts
```

### Просмотр покрытия

```bash
pnpm test:coverage
# → coverage/ директория с HTML отчётом
# → открой coverage/index.html в браузере
```

---

## E2E тесты (Playwright)

### Конфигурация

**Файл:** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 2 : 0,  // 2 ретрая в CI
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',         // Трейс при ретрае (debug)
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Тестируемые браузеры

- **Chromium** (Chrome)
- **Firefox**

### Запуск

```bash
# Все E2E тесты
pnpm test:e2e

# С интерактивным UI (отладка)
pnpm test:e2e:ui

# Конкретный файл
pnpm playwright test tests/e2e/dashboard.spec.ts

# В headed режиме (видно браузер)
pnpm playwright test --headed
```

### Структура E2E тестов

```
tests/e2e/
└── (файлы тестов — smoke тесты навигации, создания задач, drag-drop)
```

---

## Best Practices

### Что тестировать в unit тестах

- Store getters и вычисляемые значения
- Store actions (включая optimistic update + rollback)
- Сложные helper-функции (date, export)
- Composables с чистой логикой

### Что тестировать в E2E тестах

- Критические пользовательские сценарии
- Навигация между страницами
- Создание/редактирование задач через UI
- Drag & drop (базовый сценарий)

### Чего НЕ делать

- Не тестировать реализацию компонентов (только поведение)
- Не мокировать более чем нужно
- Не использовать `sleep()` в тестах — используй `waitFor`

### Пример E2E теста

```typescript
import { test, expect } from '@playwright/test'

test('создание задачи через UI', async ({ page }) => {
  await page.goto('/')

  // Переход на канбан
  await page.click('[data-nav="kanban"]')
  await expect(page).toHaveURL('/#/kanban')

  // Открытие модалки
  await page.click('[data-testid="add-task-button"]')
  await expect(page.locator('.modal')).toBeVisible()

  // Заполнение формы
  await page.fill('[name="title"]', 'E2E Test Task')
  await page.selectOption('[name="projectId"]', 'proj-1')
  await page.click('[type="submit"]')

  // Проверка появления задачи в колонке
  await expect(page.locator('.task-card').filter({ hasText: 'E2E Test Task' })).toBeVisible()
})
```
