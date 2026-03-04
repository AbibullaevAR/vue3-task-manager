# Компоненты

Все компоненты используют `<script setup>` синтаксис и TypeScript. Ниже — документация по каждому компоненту с props, emits и примерами использования.

---

## Shared UI Components

### `BaseButton`

**Файл:** `src/shared/ui/BaseButton.vue`

Базовая кнопка с вариантами и состояниями.

#### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Визуальный стиль |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер кнопки |
| `loading` | `boolean` | `false` | Показывает спиннер, блокирует клики |
| `disabled` | `boolean` | `false` | Отключает кнопку |

#### Events

| Event | Payload | Описание |
|---|---|---|
| `click` | `MouseEvent` | Клик (не стреляет при `loading` или `disabled`) |

#### Пример

```vue
<BaseButton variant="primary" size="md" :loading="isSubmitting" @click="submit">
  Создать задачу
</BaseButton>

<BaseButton variant="danger" size="sm" @click="deleteTask">
  Удалить
</BaseButton>
```

---

### `BaseModal`

**Файл:** `src/shared/ui/BaseModal.vue`

Модальное окно через `<Teleport to="body">`.

#### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `modelValue` | `boolean` | — | Управляет видимостью (v-model) |
| `title` | `string` | `''` | Заголовок в шапке модального окна |

#### Events

| Event | Payload | Описание |
|---|---|---|
| `update:modelValue` | `boolean` | Изменение видимости (для v-model) |
| `close` | — | Закрытие модалки |

#### Slots

| Slot | Описание |
|---|---|
| `default` | Тело модалки (прокручиваемое) |
| `footer` | Нижняя панель (кнопки действий) |

#### Поведение
- Закрывается по `Escape`.
- Закрывается по клику на overlay (фон).
- При открытии запрещает скролл `<body>`.
- Телепортируется в `<body>` — нет проблем с `z-index` и overflow.

#### Пример

```vue
<BaseModal v-model="isOpen" title="Создать задачу" @close="isOpen = false">
  <CreateTaskForm />

  <template #footer>
    <BaseButton variant="ghost" @click="isOpen = false">Отмена</BaseButton>
    <BaseButton variant="primary" @click="submit">Создать</BaseButton>
  </template>
</BaseModal>
```

---

### `BaseBadge`

**Файл:** `src/shared/ui/BaseBadge.vue`

Небольшой цветной бейдж для статусов, тегов и т.д.

#### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `size` | `'sm' \| 'md'` | `'md'` | Размер бейджа |
| `color` | `string` | `undefined` | CSS-цвет (hex/rgb). Задаёт bg с opacity 22% и text |

#### Пример

```vue
<!-- С явным цветом -->
<BaseBadge color="#3b82f6" size="sm">In Progress</BaseBadge>

<!-- Без цвета — серый по умолчанию -->
<BaseBadge>frontend</BaseBadge>
```

---

## Entity Components

### `TaskCard`

**Файл:** `src/entities/task/ui/TaskCard.vue`

Карточка задачи. Используется в TaskBoard (канбан).

#### Props

| Prop | Тип | Описание |
|---|---|---|
| `task` | `Task` | Объект задачи для отображения |
| `isDragging` | `boolean` | Применяет стиль при перетаскивании (opacity 0.4) |

#### Events

| Event | Payload | Описание |
|---|---|---|
| `click` | `Task` | Клик по карточке |
| `delete` | `string` | ID задачи для удаления |

#### Отображаемые данные
- **Приоритетная полоса** (левый border, цвет по приоритету)
- **Заголовок** задачи
- **Описание** (truncate)
- **Теги** (максимум 3, через `BaseBadge`)
- **Дедлайн** (красный если просрочен)
- **Оценка времени** (часы)
- **Кнопка удаления** (появляется при hover)

#### Пример

```vue
<TaskCard
  :task="task"
  :isDragging="dragState.draggedItemId === task.id"
  @delete="taskStore.deleteTask"
/>
```

---

### `TaskStatusBadge`

**Файл:** `src/entities/task/ui/TaskStatusBadge.vue`

Отображает статус или приоритет задачи как цветной бейдж.

#### Props

| Prop | Тип | Описание |
|---|---|---|
| `status` | `TaskStatus` | Статус задачи |
| `priority` | `TaskPriority` | Приоритет задачи |

Используй либо `status`, либо `priority` — не оба.

#### Пример

```vue
<TaskStatusBadge :status="task.status" />
<!-- → "In Progress" с синим цветом -->

<TaskStatusBadge :priority="task.priority" />
<!-- → "High" с красным цветом -->
```

---

### `ProjectCard`

**Файл:** `src/entities/project/ui/ProjectCard.vue`

Карточка проекта для сетки проектов.

#### Props

| Prop | Тип | Описание |
|---|---|---|
| `project` | `Project` | Объект проекта |

#### Events

| Event | Payload | Описание |
|---|---|---|
| `click` | `Project` | Клик по карточке |

#### Отображаемые данные
- **Цветная полоса** (top border, цвет `project.color`)
- **Название** проекта
- **Статус** (бейдж)
- **Описание**
- **Прогресс-бар** (`completedTaskCount / taskCount`)
- **Количество участников**
- **Дедлайн** проекта

---

### `UserAvatar`

**Файл:** `src/entities/user/ui/UserAvatar.vue`

Аватар пользователя: фото или инициалы.

#### Props

| Prop | Тип | По умолчанию | Описание |
|---|---|---|---|
| `user` | `User` | — | Объект пользователя |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Размер: 24/32/40px |

#### Поведение
- Если `user.avatar` — показывает `<img>`.
- Если нет — генерирует инициалы и цвет из хэша имени (7 вариантов цветов).

```vue
<UserAvatar :user="user" size="sm" />
```

---

## Widget Components

### `StatsOverview`

**Файл:** `src/widgets/stats-overview/StatsOverview.vue`

4 карточки статистики вверху Dashboard.

**Нет props** — напрямую использует `useTaskStore()`.

| Карточка | Описание |
|---|---|
| Total Tasks | Общее количество задач |
| In Progress | Задачи со статусом `in_progress` |
| Completed | Задачи `done` + процент завершённости |
| Overdue | Просроченные задачи (deadline в прошлом, не `done`) |

---

### `TaskBoard`

**Файл:** `src/widgets/task-board/TaskBoard.vue`

Основная канбан-доска с 5 колонками и drag-drop.

#### Props

| Prop | Тип | Описание |
|---|---|---|
| `tasks` | `Task[]` | Массив задач для отображения |

#### Events

| Event | Payload | Описание |
|---|---|---|
| `create-task` | `TaskStatus` | Клик "+" в колонке — передаёт начальный статус |

#### Колонки

| Ключ | Название | WIP лимит |
|---|---|---|
| `backlog` | Backlog | — |
| `todo` | To Do | — |
| `in_progress` | In Progress | 5 |
| `review` | Review | 3 |
| `done` | Done | — |

#### Drag & Drop
Использует `useDragDrop<Task>`. При drop вызывает `taskStore.moveTask()`.

#### Пример

```vue
<TaskBoard
  :tasks="filteredTasks"
  @create-task="(status) => openModal(status)"
/>
```

---

### `ActivityFeed`

**Файл:** `src/widgets/activity-feed/ActivityFeed.vue`

Лента последних обновлений (10 задач, отсортированных по `updatedAt` desc).

**Нет props** — использует `useTaskStore()` и `useUserStore()`.

Каждый элемент ленты:
- Цветная точка (цвет по статусу)
- Имя пользователя (`assigneeId` → `userStore.getUserById`)
- Заголовок задачи
- Статус
- Относительное время (`fromNow(task.updatedAt)`)

---

### `ProjectList`

**Файл:** `src/widgets/project-list/ProjectList.vue`

Сетка активных проектов.

**Нет props** — использует `useProjectStore()`.

- Отображает только `activeProjects` (status === 'active').
- Клик по карточке → переход на `/projects?id=projectId`.
- Состояния: загрузка, пусто, список.

---

## Feature Components

### `CreateTaskModal`

**Файл:** `src/features/create-task/CreateTaskModal.vue`

Модальная форма создания задачи.

#### Props

| Prop | Тип | Описание |
|---|---|---|
| `modelValue` | `boolean` | Видимость (v-model) |
| `initialStatus` | `TaskStatus` | Начальный статус новой задачи |

#### Events

| Event | Payload | Описание |
|---|---|---|
| `update:modelValue` | `boolean` | Закрытие/открытие |
| `submit` | `TaskCreatePayload` | Данные новой задачи |
| `close` | — | Закрытие без сохранения |

#### Поля формы

| Поле | Тип | Обязательное |
|---|---|---|
| Title | Text | ✅ |
| Description | Textarea | — |
| Status | Select | ✅ |
| Priority | Select | ✅ |
| Project | Select | ✅ |
| Assignee | Select | — |
| Deadline | Date | — |
| Estimated Hours | Number | — |
| Tags | Tag input | — |

**Tag input:** добавление тега по `Enter` или запятой, удаление по `×`.

---

### `FilterPanel`

**Файл:** `src/features/filter-tasks/FilterPanel.vue`

Панель фильтров для канбан-доски.

#### Props / Events

```typescript
// v-model для объекта фильтров
const props = defineProps<{ modelValue: TaskFilters }>()
const emit = defineEmits<{
  'update:modelValue': [TaskFilters]
  'reset': []
}>()
```

#### Фильтры

| Фильтр | UI | Режим |
|---|---|---|
| Search | Text input | Частичное совпадение в title + description |
| Status | Chips (multi) | `['todo', 'in_progress']` |
| Priority | Chips (multi) | `['high', 'critical']` |
| Assignee | Dropdown | Одиночный выбор |

---

### `ExportButton`

**Файл:** `src/features/export-data/ExportButton.vue`

Кнопка с выпадающим меню для экспорта задач.

#### Форматы

- **CSV** — через `exportCSV()` из `shared/lib/helpers/export.ts`
- **JSON** — через `exportJSON()`

Экспортируемые поля: `id, title, status, priority, projectId, assigneeId, deadline, estimatedHours, tags, createdAt`

---

### `ThemeToggle`

**Файл:** `src/features/theme-toggle/ThemeToggle.vue`

Кнопка переключения темы.

#### Логика

```typescript
// При монтировании: читает из localStorage или system preference
const savedTheme = localStorage.getItem('theme')
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
currentTheme = savedTheme ?? (systemDark ? 'dark' : 'light')

// Применение темы
document.documentElement.setAttribute('data-theme', currentTheme)

// Сохранение
localStorage.setItem('theme', currentTheme)
```

- `data-theme="light"` → используются CSS переменные из `:root`
- `data-theme="dark"` → CSS переменные переопределяются в `[data-theme="dark"]`
