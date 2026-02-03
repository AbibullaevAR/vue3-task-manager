/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import type { Connect } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

// ─── In-memory mock store ─────────────────────────────────────────────────────
const now = () => new Date().toISOString()

const mockUsers = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', avatar: null, role: 'admin', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'user-2', name: 'Bob Smith', email: 'bob@example.com', avatar: null, role: 'member', createdAt: '2024-01-02T00:00:00Z' },
  { id: 'user-3', name: 'Carol White', email: 'carol@example.com', avatar: null, role: 'member', createdAt: '2024-01-03T00:00:00Z' },
]

const mockProjects = [
  { id: 'proj-1', name: 'Dashboard Redesign', description: 'Modernize the analytics dashboard', status: 'active', color: '#6366f1', ownerId: 'user-1', memberIds: ['user-1', 'user-2'], taskCount: 0, completedTaskCount: 0, deadline: '2025-06-30', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'proj-2', name: 'API Integration', description: 'Connect to third-party services', status: 'active', color: '#10b981', ownerId: 'user-2', memberIds: ['user-1', 'user-2', 'user-3'], taskCount: 0, completedTaskCount: 0, deadline: '2025-08-15', createdAt: '2024-01-05T00:00:00Z', updatedAt: '2024-01-05T00:00:00Z' },
  { id: 'proj-3', name: 'Mobile App', description: 'React Native companion app', status: 'active', color: '#f59e0b', ownerId: 'user-1', memberIds: ['user-1', 'user-3'], taskCount: 0, completedTaskCount: 0, deadline: '2025-12-01', createdAt: '2024-02-01T00:00:00Z', updatedAt: '2024-02-01T00:00:00Z' },
]

const mockTasksData = [
  { id: 'task-1', title: 'Setup project structure', description: 'Initialize the repo and configure build tools', status: 'done', priority: 'high', projectId: 'proj-1', assigneeId: 'user-1', creatorId: 'user-1', tags: ['setup', 'devops'], deadline: null, estimatedHours: 4, order: 0, createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-01-11T00:00:00Z' },
  { id: 'task-2', title: 'Design system tokens', description: 'Define colors, typography, and spacing', status: 'done', priority: 'high', projectId: 'proj-1', assigneeId: 'user-2', creatorId: 'user-1', tags: ['design', 'ui'], deadline: null, estimatedHours: 6, order: 1, createdAt: '2024-01-11T00:00:00Z', updatedAt: '2024-01-12T00:00:00Z' },
  { id: 'task-3', title: 'Implement Kanban board', description: 'Drag and drop task management with columns', status: 'in_progress', priority: 'critical', projectId: 'proj-1', assigneeId: 'user-1', creatorId: 'user-1', tags: ['frontend', 'feature'], deadline: '2025-03-15', estimatedHours: 16, order: 0, createdAt: '2024-01-12T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
  { id: 'task-4', title: 'Analytics dashboard charts', description: 'ECharts integration for burndown and velocity', status: 'todo', priority: 'high', projectId: 'proj-1', assigneeId: 'user-2', creatorId: 'user-1', tags: ['frontend', 'charts'], deadline: '2025-03-20', estimatedHours: 12, order: 0, createdAt: '2024-01-13T00:00:00Z', updatedAt: '2024-01-13T00:00:00Z' },
  { id: 'task-5', title: 'Write unit tests', description: 'Achieve 90%+ coverage on store and composables', status: 'todo', priority: 'medium', projectId: 'proj-1', assigneeId: 'user-3', creatorId: 'user-1', tags: ['testing'], deadline: '2025-04-01', estimatedHours: 8, order: 1, createdAt: '2024-01-14T00:00:00Z', updatedAt: '2024-01-14T00:00:00Z' },
  { id: 'task-6', title: 'REST API client', description: 'Typed HTTP client with error handling', status: 'review', priority: 'high', projectId: 'proj-2', assigneeId: 'user-2', creatorId: 'user-2', tags: ['backend', 'api'], deadline: null, estimatedHours: 6, order: 0, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-16T00:00:00Z' },
  { id: 'task-7', title: 'Authentication flow', description: 'JWT tokens with refresh logic', status: 'in_progress', priority: 'critical', projectId: 'proj-2', assigneeId: 'user-1', creatorId: 'user-2', tags: ['backend', 'auth', 'security'], deadline: '2025-02-28', estimatedHours: 10, order: 1, createdAt: '2024-01-16T00:00:00Z', updatedAt: '2024-01-17T00:00:00Z' },
  { id: 'task-8', title: 'Rate limiting middleware', description: 'Prevent API abuse with token bucket', status: 'backlog', priority: 'medium', projectId: 'proj-2', assigneeId: null, creatorId: 'user-2', tags: ['backend', 'security'], deadline: null, estimatedHours: 4, order: 0, createdAt: '2024-01-17T00:00:00Z', updatedAt: '2024-01-17T00:00:00Z' },
  { id: 'task-9', title: 'Push notifications', description: 'FCM integration for mobile alerts', status: 'backlog', priority: 'low', projectId: 'proj-3', assigneeId: null, creatorId: 'user-1', tags: ['mobile', 'notifications'], deadline: null, estimatedHours: 8, order: 0, createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
  { id: 'task-10', title: 'Offline mode', description: 'Service Worker with background sync', status: 'todo', priority: 'medium', projectId: 'proj-1', assigneeId: 'user-3', creatorId: 'user-1', tags: ['pwa', 'offline'], deadline: '2025-05-01', estimatedHours: 12, order: 2, createdAt: '2024-01-21T00:00:00Z', updatedAt: '2024-01-21T00:00:00Z' },
]

const tasks = new Map(mockTasksData.map(t => [t.id, { ...t }]))
let taskIdCounter = mockTasksData.length + 1

// ─── Mock API middleware ───────────────────────────────────────────────────────
function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(body)) } catch { resolve({}) }
    })
  })
}

function json(res: ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function mockApiMiddleware(): Connect.HandleFunction {
  return async (req, res, next) => {
    const url = req.url ?? ''
    const method = req.method ?? 'GET'

    if (!url.startsWith('/api/')) return next()

    const path = url.replace('/api', '').split('?')[0]
    const parts = path.split('/').filter(Boolean)

    // GET /api/tasks
    if (method === 'GET' && parts[0] === 'tasks' && !parts[1]) {
      const projectId = new URL(url, 'http://x').searchParams.get('projectId')
      const list = [...tasks.values()]
      return json(res, projectId ? list.filter(t => t.projectId === projectId) : list)
    }

    // GET /api/tasks/:id
    if (method === 'GET' && parts[0] === 'tasks' && parts[1] && !parts[2]) {
      const task = tasks.get(parts[1])
      return task ? json(res, task) : json(res, { message: 'Not found' }, 404)
    }

    // POST /api/tasks
    if (method === 'POST' && parts[0] === 'tasks') {
      const body = await readBody(req)
      const id = `task-${++taskIdCounter}`
      const task = { id, ...body, order: 0, creatorId: 'user-1', createdAt: now(), updatedAt: now() }
      tasks.set(id, task as typeof mockTasksData[0])
      return json(res, task, 201)
    }

    // PATCH /api/tasks/:id
    if (method === 'PATCH' && parts[0] === 'tasks' && parts[1]) {
      const task = tasks.get(parts[1])
      if (!task) return json(res, { message: 'Not found' }, 404)
      const body = await readBody(req)
      const updated = { ...task, ...body, updatedAt: now() }
      tasks.set(parts[1], updated)
      return json(res, updated)
    }

    // PUT /api/tasks/:id/reorder
    if (method === 'PUT' && parts[0] === 'tasks' && parts[2] === 'reorder') {
      const task = tasks.get(parts[1])
      if (!task) return json(res, { message: 'Not found' }, 404)
      const body = await readBody(req)
      const updated = { ...task, ...(body as object), updatedAt: now() }
      tasks.set(parts[1], updated)
      return json(res, null)
    }

    // DELETE /api/tasks/:id
    if (method === 'DELETE' && parts[0] === 'tasks' && parts[1]) {
      tasks.delete(parts[1])
      res.writeHead(204)
      return res.end()
    }

    // GET /api/projects
    if (method === 'GET' && parts[0] === 'projects') {
      return json(res, mockProjects)
    }

    // GET /api/users
    if (method === 'GET' && parts[0] === 'users') {
      return json(res, mockUsers)
    }

    next()
  }
}

// ─── Vite config ──────────────────────────────────────────────────────────────
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'mock-api',
      configureServer(server) {
        server.middlewares.use(mockApiMiddleware())
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  },
})
