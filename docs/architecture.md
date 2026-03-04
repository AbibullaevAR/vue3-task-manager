# Архитектура проекта

## Feature-Sliced Design v2

Проект строго следует методологии **Feature-Sliced Design (FSD) v2**. Основной принцип — однонаправленный поток импортов сверху вниз:

```
app → pages → widgets → features → entities → shared
```

**Запрещено**: нижние слои не могут импортировать из верхних.
**Разрешено**: каждый слой может импортировать только из слоёв ниже.

---

## Слои и их ответственность

### `app/` — Слой приложения
Инициализация приложения. Здесь живут роутер, глобальные стили, провайдеры.

```
src/app/
├── router/
│   ├── index.ts      # Создание router instance (createWebHashHistory)
│   ├── routes.ts     # Определение маршрутов (lazy-loaded страницы)
│   └── guards.ts     # Navigation guards (обновление document.title)
└── styles/
    ├── global.scss      # Глобальный CSS reset, базовые стили, layout
    └── _variables.scss  # CSS custom properties для тем light/dark
```

**Ключевые решения:**
- Используется `createWebHashHistory` (hash-роутер), работает без конфигурации сервера.
- Маршруты подключаются через динамические импорты (`() => import(...)`), что даёт code splitting.

---

### `pages/` — Страницы

Компоненты маршрутов — "оркестраторы". Страница не содержит бизнес-логики, она лишь вызывает store-методы и компонует виджеты.

```
src/pages/
├── dashboard/DashboardPage.vue   # Главная: статистика, проекты, активность
├── kanban/KanbanPage.vue         # Канбан-доска: фильтры, drag-drop, создание задач
└── projects/ProjectsPage.vue     # Список всех проектов
```

**Правила для страниц:**
- Вызывают `store.fetchXxx()` в `onMounted`.
- Передают данные в виджеты через props.
- Обрабатывают роутинг (переходы между страницами).
- Управляют видимостью модальных окон.

---

### `widgets/` — Виджеты

Составные UI-блоки, которые могут объединять несколько entities и features. Виджет "знает" о store, но не напрямую мутирует его из UI.

```
src/widgets/
├── stats-overview/StatsOverview.vue   # 4 карточки: Total/In Progress/Completed/Overdue
├── task-board/TaskBoard.vue           # 5-колоночная канбан-доска с drag-drop
├── activity-feed/ActivityFeed.vue     # Лента последних обновлений задач
└── project-list/ProjectList.vue       # Сетка активных проектов
```

---

### `features/` — Фичи

Модули пользовательских взаимодействий. Каждая фича — самодостаточный модуль с чётко определёнными входами (props/events) и выходами (emit).

```
src/features/
├── create-task/CreateTaskModal.vue   # Форма создания задачи в модальном окне
├── filter-tasks/FilterPanel.vue      # Панель фильтров (статус, приоритет, исполнитель)
├── export-data/ExportButton.vue      # Экспорт в CSV/JSON
├── theme-toggle/ThemeToggle.vue      # Переключатель светлой/тёмной темы
└── drag-drop/index.ts                # Re-export composable useDragDrop
```

---

### `entities/` — Сущности

Доменные объекты приложения. Каждая сущность содержит: API-функции, Pinia-store, TypeScript-типы и UI-компоненты для отображения.

```
src/entities/
├── task/                         # Полная референсная реализация
│   ├── api/task.api.ts           # REST вызовы через fetch
│   ├── model/
│   │   ├── task.types.ts         # TaskStatus, TaskPriority, Task, TaskFilters, ...
│   │   ├── task.store.ts         # Pinia store: state, getters, actions
│   │   └── task.selectors.ts     # Производные вычисления (tagCloud, burndown)
│   └── ui/
│       ├── TaskCard.vue          # Карточка задачи с drag-handle
│       └── TaskStatusBadge.vue   # Цветной бейдж статуса/приоритета
│
├── project/                      # По образцу task entity
│   ├── api/project.api.ts
│   ├── model/project.types.ts
│   ├── model/project.store.ts
│   └── ui/ProjectCard.vue
│
└── user/                         # По образцу task entity
    ├── api/user.api.ts
    ├── model/user.types.ts
    ├── model/user.store.ts
    └── ui/UserAvatar.vue
```

**`task` — референсная реализация.** При добавлении новых сущностей — копируй её структуру.

---

### `shared/` — Общие утилиты

Слой, не зависящий от бизнес-логики. Содержит переиспользуемые компоненты, helpers, composables и типы.

```
src/shared/
├── api/http-client.ts         # Базовый HTTP клиент (fetch + HttpError)
├── config/constants.ts        # Глобальные константы
├── lib/
│   ├── composables/
│   │   ├── useDragDrop.ts        # Generic drag-drop (HTML5 DnD API)
│   │   ├── useVirtualScroll.ts   # Виртуальный скроллинг
│   │   ├── useUrlFilters.ts      # Синхронизация фильтров с URL
│   │   └── useOptimisticUpdate.ts # Паттерн оптимистичных обновлений
│   └── helpers/
│       ├── date.ts               # formatDate, isPast, fromNow, daysUntil
│       └── export.ts             # toCSV, exportCSV, exportJSON, downloadFile
├── types/index.ts             # ApiError, PaginatedResponse, Theme
└── ui/
    ├── BaseButton.vue         # Базовая кнопка (variants, sizes, loading)
    ├── BaseModal.vue          # Модальное окно (teleport, overlay, escape)
    └── BaseBadge.vue          # Цветной бейдж
```

---

## Правила импортов

```typescript
// ✅ Правильно: page → widget → entity → shared
// src/pages/kanban/KanbanPage.vue
import TaskBoard from '@/widgets/task-board/TaskBoard.vue'
import { useTaskStore } from '@/entities/task/model/task.store'
import BaseButton from '@/shared/ui/BaseButton.vue'

// ❌ Запрещено: entity импортирует из widget (нарушение FSD)
// src/entities/task/model/task.store.ts
import TaskBoard from '@/widgets/task-board/TaskBoard.vue' // ОШИБКА!

// ❌ Запрещено: shared импортирует из features
// src/shared/ui/BaseButton.vue
import CreateTaskModal from '@/features/create-task/CreateTaskModal.vue' // ОШИБКА!
```

**Path alias `@/`** указывает на `src/`. Настроен в `tsconfig.app.json` и `vite.config.ts`.

---

## Потоки данных

```
┌─────────────────────────────────────────────────────┐
│                      Page                            │
│  onMounted → store.fetchTasks()                     │
│  computed  ← store.tasks                            │
│  template  → <Widget :tasks="filteredTasks" />      │
└──────────────────────┬──────────────────────────────┘
                       │ props
                       ▼
┌─────────────────────────────────────────────────────┐
│                     Widget                           │
│  Компонует entities + features                      │
│  template → <TaskCard v-for="task" />               │
│  @drop     → store.moveTask()                       │
└──────────────────────┬──────────────────────────────┘
                       │ emit events
                       ▼
┌─────────────────────────────────────────────────────┐
│                  Feature / Entity                    │
│  Emit 'submit' → page handler → store.createTask()  │
└─────────────────────────────────────────────────────┘
```
