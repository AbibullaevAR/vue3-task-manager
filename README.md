# 📊 Vue 3 Project Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.4-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Pinia-2.1-ffd859?logo=vuedotjs&logoColor=black" alt="Pinia" />
  <img src="https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Architecture-FSD-blue" alt="FSD" />
  <img src="https://img.shields.io/badge/Tests-87%25-brightgreen" alt="Tests" />
</p>

A feature-rich project management dashboard built with **Vue 3 Composition API**, **TypeScript**, **Pinia**, and **Feature-Sliced Design**. Includes Kanban board with drag & drop, real-time analytics charts, and comprehensive testing.

## ✨ Features

- **Kanban Board** — drag & drop task management (native HTML5 DnD API, no dependencies)
- **Analytics Dashboard** — interactive charts with ECharts (tasks by status, burndown, velocity)
- **Project Management** — CRUD for projects with team members and deadlines
- **Advanced Filtering** — multi-criteria task filtering with URL sync
- **Data Export** — export to CSV/JSON with custom field selection
- **Dark Mode** — system-aware theme switching with smooth transitions
- **Optimistic Updates** — instant UI feedback with background sync
- **Virtual Scrolling** — handles 10,000+ tasks without performance degradation
- **Keyboard Shortcuts** — Ctrl+K command palette, task navigation
- **Offline Ready** — Service Worker with background sync queue

## 🏗 Architecture (Feature-Sliced Design)

```
src/
├── app/                              # App initialization
│   ├── router/
│   │   ├── index.ts                  # Vue Router setup
│   │   ├── routes.ts                 # Route definitions
│   │   └── guards.ts                 # Navigation guards
│   └── styles/
│       ├── global.scss
│       └── _variables.scss
│
├── pages/                            # Page compositions
│   ├── dashboard/                    # Analytics overview
│   ├── projects/                     # Project list & detail
│   └── kanban/                       # Kanban board view
│
├── widgets/                          # Composite blocks
│   ├── stats-overview/               # KPI cards row
│   ├── task-board/                   # Kanban columns
│   ├── activity-feed/                # Recent activity timeline
│   └── project-list/                 # Project cards grid
│
├── features/                         # User interactions
│   ├── create-task/                  # Task creation modal + form
│   ├── filter-tasks/                 # Multi-filter panel
│   ├── drag-drop/                    # DnD composable + handlers
│   ├── theme-toggle/                 # Dark/light mode
│   └── export-data/                  # CSV/JSON export
│
├── entities/                         # Business objects
│   ├── task/
│   │   ├── api/task.api.ts
│   │   ├── model/
│   │   │   ├── task.store.ts         # Pinia store
│   │   │   ├── task.types.ts         # TypeScript interfaces
│   │   │   └── task.selectors.ts     # Derived state
│   │   └── ui/
│   │       ├── TaskCard.vue
│   │       └── TaskStatusBadge.vue
│   ├── project/
│   └── user/
│
└── shared/                           # Reusable utilities
    ├── api/http-client.ts
    ├── config/constants.ts
    ├── lib/
    │   ├── composables/
    │   │   ├── useDragDrop.ts        # Generic DnD composable
    │   │   ├── useVirtualScroll.ts   # Virtual list composable
    │   │   ├── useUrlFilters.ts      # URL ↔ filter state sync
    │   │   └── useOptimisticUpdate.ts
    │   └── helpers/
    │       ├── date.ts
    │       └── export.ts
    ├── ui/                           # Base UI components
    └── types/
```

## 🚀 Quick Start

```bash
pnpm install
pnpm dev          # Start dev server at http://localhost:5173
pnpm build        # Production build
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests with Playwright
```

## 🔑 Key Technical Highlights

### 1. Custom Drag & Drop (Zero Dependencies)

```typescript
// composables/useDragDrop.ts — Generic, reusable DnD with TypeScript generics
const { dragState, handleDragStart, handleDrop } = useDragDrop<Task>({
  onReorder: (taskId, fromColumn, toColumn, newIndex) => {
    taskStore.moveTask(taskId, fromColumn, toColumn, newIndex)
  },
})
```

Uses native HTML5 Drag & Drop API with:
- Touch device support via pointer events fallback
- Smooth drag preview with CSS transforms
- Accessible keyboard alternative (Arrow keys + Enter)
- Optimistic reordering with rollback on API failure

### 2. Optimistic Updates Pattern

```typescript
// composables/useOptimisticUpdate.ts
const { execute } = useOptimisticUpdate({
  optimistic: (task) => taskStore.updateLocal(task),
  request: (task) => taskApi.update(task.id, task),
  rollback: (previousState) => taskStore.setLocal(previousState),
  onError: (error) => notify.error('Failed to update task'),
})
```

### 3. URL-Synced Filters

Filter state is automatically synced with URL query parameters, enabling shareable filtered views:

```typescript
// composables/useUrlFilters.ts
const filters = useUrlFilters({
  status: { type: 'array', default: [] },
  priority: { type: 'string', default: 'all' },
  assignee: { type: 'string', default: '' },
  search: { type: 'string', default: '', debounce: 300 },
  sort: { type: 'string', default: 'newest' },
})
```

### 4. Virtual Scrolling for Large Lists

Custom virtual scroll composable handles 10,000+ items at 60fps:

```typescript
const { visibleItems, containerProps, wrapperProps } = useVirtualScroll(tasks, {
  itemHeight: 72,
  overscan: 5,
})
```

### 5. Pinia Store with Selectors

```typescript
// entities/task/model/task.selectors.ts
export const useTaskSelectors = () => {
  const store = useTaskStore()

  const tasksByStatus = computed(() =>
    groupBy(store.tasks, 'status')
  )

  const overdueTasks = computed(() =>
    store.tasks.filter(t =>
      t.deadline && isPast(new Date(t.deadline)) && t.status !== 'done'
    )
  )

  const burndownData = computed(() =>
    calculateBurndown(store.tasks, store.sprintStart, store.sprintEnd)
  )

  return { tasksByStatus, overdueTasks, burndownData }
}
```

## 🛠 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Vue 3.4 (Composition API, `<script setup>`) |
| **Language** | TypeScript 5.3 (strict mode) |
| **State** | Pinia 2.1 + custom selectors pattern |
| **Build** | Vite 5.2 |
| **Router** | Vue Router 4.3 |
| **Charts** | ECharts 5 (via vue-echarts) |
| **Architecture** | Feature-Sliced Design v2 |
| **Styling** | SCSS + BEM + CSS Custom Properties |
| **Testing** | Vitest + Vue Test Utils + Playwright |
| **CI/CD** | GitHub Actions |
| **Linting** | ESLint + Prettier + Stylelint |

## 📊 Performance Optimizations

| Technique | Impact |
|-----------|--------|
| Route-based code splitting | First Load JS: 52 kB gzip |
| `defineAsyncComponent` for charts | Dashboard TTI: -40% |
| `v-memo` on task cards | Kanban re-render: -65% |
| Debounced search + AbortController | No wasted API calls |
| `shallowRef` for large lists | Memory usage: -30% |
| CSS `content-visibility: auto` | Scroll performance: 60fps |
| Service Worker pre-caching | Repeat visit: < 500ms |

## 🧪 Testing Strategy

```bash
pnpm test                    # Unit + component tests
pnpm test:coverage           # With coverage report
pnpm test:e2e                # Playwright E2E tests
pnpm test:e2e --ui           # Playwright UI mode
```

**Coverage**: 87% statements, 83% branches

| Layer | Test Type | Coverage |
|-------|-----------|----------|
| Shared (composables, helpers) | Unit tests | 95% |
| Entities (stores, selectors) | Unit tests | 92% |
| Features (user flows) | Component tests | 85% |
| Widgets | Component tests | 80% |
| Pages (integration) | E2E (Playwright) | Key flows |

## 🔄 CI/CD

GitHub Actions workflow:
1. **Lint & Typecheck** — ESLint + vue-tsc
2. **Unit Tests** — Vitest with coverage threshold
3. **E2E Tests** — Playwright on Chromium + Firefox
4. **Build** — Production build + bundle size check
5. **Deploy** — Auto-deploy to Vercel on `main`

## 📄 License

MIT © 2025
