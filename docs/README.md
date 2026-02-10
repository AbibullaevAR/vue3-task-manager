# Vue 3 Project Dashboard — Документация

> Полная документация проекта **vue3-task-manager** — менеджера задач с Feature-Sliced Design.

## Содержание

| Документ | Описание |
|---|---|
| [architecture.md](./architecture.md) | Архитектура FSD, слои, правила импорта |
| [components.md](./components.md) | Все Vue-компоненты (pages, widgets, features, entities, shared/ui) |
| [stores.md](./stores.md) | Pinia-хранилища, паттерны оптимистичных обновлений |
| [composables.md](./composables.md) | Переиспользуемые composables |
| [api.md](./api.md) | API-слой, HTTP-клиент, mock API |
| [testing.md](./testing.md) | Тестирование: unit (Vitest) и E2E (Playwright) |
| [ci-cd.md](./ci-cd.md) | CI/CD пайплайн на GitHub Actions |
| [styling.md](./styling.md) | SCSS, BEM, тема (light/dark) |

---

## Быстрый старт

```bash
# Установка зависимостей
pnpm install

# Запуск dev-сервера (с mock API)
pnpm dev        # → http://localhost:5173

# Сборка production
pnpm build

# Все тесты
pnpm test

# E2E тесты
pnpm test:e2e
```

## Технологический стек

| Категория | Технология | Версия |
|---|---|---|
| UI Framework | Vue | ^3.4 |
| Language | TypeScript | ^5.3 |
| State Management | Pinia | ^2.1 |
| Router | Vue Router | ^4.3 |
| Build Tool | Vite | ^5.2 |
| Styling | SCSS + BEM | - |
| Unit Tests | Vitest | ^1.6 |
| E2E Tests | Playwright | ^1.43 |
| Charts | ECharts + vue-echarts | ^5.5 / ^6.6 |
| Utilities | VueUse | ^10.9 |

## Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_API_BASE` | Базовый URL для API запросов | `/api` |

Скопируйте `.env.example` в `.env.local` и настройте переменные:

```bash
cp .env.example .env.local
```

## Структура директорий (обзор)

```
src/
├── app/           # Инициализация приложения (роутер, глобальные стили)
├── pages/         # Страницы-маршруты (dashboard, kanban, projects)
├── widgets/       # Составные UI-блоки (stats-overview, task-board, ...)
├── features/      # Модули взаимодействия (create-task, filter-tasks, ...)
├── entities/      # Доменные объекты (task, project, user)
└── shared/        # Переиспользуемые утилиты (ui, api, lib, types)
```

Подробнее — в [architecture.md](./architecture.md).
