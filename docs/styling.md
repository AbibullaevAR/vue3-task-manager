# Стилизация

## Технологии

- **SCSS** — препроцессор CSS
- **BEM** — методология именования классов
- **CSS Custom Properties** — переменные для тем
- **Stylelint** — линтер стилей

---

## CSS Custom Properties (темы)

**Файл:** `src/app/styles/_variables.scss`

Все визуальные параметры задаются через CSS переменные, что позволяет менять тему без JavaScript.

### Структура переменных

```scss
// Светлая тема (по умолчанию)
:root {
  // Фоновые цвета
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-raised: #f1f5f9;

  // Границы
  --color-border: #e2e8f0;
  --color-border-subtle: #f1f5f9;

  // Текст
  --color-text: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;

  // Акцентные цвета
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-subtle: #eff6ff;

  // Функциональные цвета
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-success: #10b981;

  // Тени
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  // Скругления
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  // Layout
  --sidebar-width: 220px;
  --header-height: 60px;
}

// Тёмная тема
[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-surface-raised: #334155;
  --color-border: #334155;
  --color-border-subtle: #1e293b;
  --color-text: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  // ... остальные переопределяются
}
```

### Применение переменных в компонентах

```scss
.task-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  color: var(--color-text);

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
  }
}
```

---

## BEM Методология

**B**lock — **E**lement — **M**odifier

```scss
// Block
.task-card { ... }

// Element (двойное подчёркивание)
.task-card__title { ... }
.task-card__tags { ... }
.task-card__deadline { ... }

// Modifier (двойное тире)
.task-card--dragging { opacity: 0.4; }
.task-card--priority-high { border-left-color: var(--color-danger); }
.task-card--priority-critical { border-left-color: #7c3aed; }
```

### Правила именования

| Категория | Паттерн | Пример |
|---|---|---|
| Block | kebab-case | `.task-card`, `.stats-overview` |
| Element | `block__element` | `.task-card__title` |
| Modifier (boolean) | `block--modifier` | `.task-card--dragging` |
| Modifier (value) | `block--key-value` | `.task-card--priority-high` |
| State | `block--is-state` | `.column--is-over-limit` |

---

## Глобальные стили

**Файл:** `src/app/styles/global.scss`

```scss
// CSS Reset
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

// Layout
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

.app-sidebar {
  width: var(--sidebar-width);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  height: 100vh;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  height: var(--header-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}
```

---

## Stylelint

**Команда:** `pnpm stylelint`

Применяется к `src/**/*.{scss,vue}`.

### Ключевые правила
- Запрет magic-числа без комментариев
- BEM-совместимые имена классов
- Порядок CSS-свойств (позиционирование → display → box model → типографика → визуальные)
- Запрет дублирующихся деклараций

---

## Responsive Design

### Брейкпоинты (используются в компонентах)

| Название | Значение | Использование |
|---|---|---|
| Mobile | `< 480px` | TaskBoard: 2 колонки |
| Tablet | `< 780px` | TaskBoard: 3 колонки |
| Desktop | `≥ 1200px` | TaskBoard: все 5 колонок |

```scss
// TaskBoard пример
.task-board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 780px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Адаптивные сетки через `auto-fill`

```scss
// Карточки проектов — автоматически подстраиваются
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

// Статистика — автоматически
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}
```

---

## Scoped Styles

Все стили компонентов используют `<style lang="scss">` **без** `scoped`. Изоляция достигается через BEM-namespace уникального блока. Это позволяет легче переопределять стили снаружи при необходимости.

```vue
<template>
  <div class="task-card task-card--priority-high">
    <h3 class="task-card__title">{{ task.title }}</h3>
  </div>
</template>

<style lang="scss">
.task-card {
  // Стили блока
  &__title {
    // Стили элемента
  }
  &--priority-high {
    // Стили модификатора
  }
}
</style>
```
