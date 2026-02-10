# CI/CD

## GitHub Actions

**Файл:** `.github/workflows/ci.yml`

Пайплайн запускается при каждом push и pull request в ветки `main` и `develop`.

---

## Структура пайплайна

```
Push/PR
   │
   ├─► [Job 1] Lint & Type Check
   │       └─ pnpm lint
   │       └─ pnpm typecheck
   │
   ├─► [Job 2] Unit Tests
   │       └─ pnpm test:coverage (порог 85%)
   │       └─ Upload coverage artifact
   │
   ├─► [Job 3] E2E Tests
   │       └─ Playwright install
   │       └─ pnpm test:e2e (Chromium + Firefox)
   │       └─ Upload report on failure
   │
   └─► [Job 4] Build & Bundle Check
           └─ pnpm build
           └─ Проверка размера бандла (≤ 200KB gzip)
```

---

## Jobs подробно

### Job 1: Lint & Type Check

```yaml
lint-and-typecheck:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v3
    - uses: actions/setup-node@v4
      with: { node-version: '20', cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm lint
    - run: pnpm typecheck
```

**Проверяет:**
- ESLint правила для `.vue`, `.ts`, `.tsx`
- TypeScript strict mode (нет неиспользуемых переменных, корректные типы)

---

### Job 2: Unit Tests

```yaml
unit-tests:
  runs-on: ubuntu-latest
  steps:
    - ... (checkout, node, pnpm)
    - run: pnpm test:coverage
    - uses: actions/upload-artifact@v4
      with:
        name: coverage-report
        path: coverage/
```

**Условия прохождения:**
- Все тесты зелёные
- Покрытие ≥ 85% statements
- Покрытие ≥ 80% branches
- Покрытие ≥ 85% functions
- Покрытие ≥ 85% lines

---

### Job 3: E2E Tests

```yaml
e2e-tests:
  runs-on: ubuntu-latest
  steps:
    - ... (checkout, node, pnpm)
    - run: pnpm playwright install --with-deps chromium firefox
    - run: pnpm test:e2e
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

- Запускается на Chrome и Firefox
- 2 ретрая при флакающих тестах
- Playwright report загружается только при падении (для отладки)

---

### Job 4: Build & Bundle Check

```yaml
build:
  runs-on: ubuntu-latest
  steps:
    - ... (checkout, node, pnpm)
    - run: pnpm build
    - name: Check bundle size
      run: |
        BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
        echo "Bundle size: $BUNDLE_SIZE"
        # Проверка что gzip < 200KB
```

- Запускает `vue-tsc --noEmit && vite build`
- Проверяет размер итогового бандла

---

## Кэширование

`pnpm/action-setup` + `actions/setup-node` с `cache: 'pnpm'` — автоматически кэшируют `node_modules` между запусками на основе `pnpm-lock.yaml`. Значительно ускоряет повторные запуски.

---

## Артефакты

| Артефакт | Когда | Описание |
|---|---|---|
| `coverage-report` | Всегда | HTML отчёт покрытия (`coverage/`) |
| `playwright-report` | При падении | Playwright HTML отчёт с скриншотами |

---

## Статусы веток

Рекомендуется настроить branch protection для `main`:
- Требовать прохождения всех 4 jobs перед merge
- Запретить прямые push в `main`
- Требовать обновления ветки с `main` перед merge

---

## Локальное воспроизведение CI

```bash
# Полный прогон как в CI
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build

# Только быстрые проверки
pnpm lint && pnpm typecheck

# Только тесты
pnpm test
```
