export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export const DEBOUNCE_DELAY = 300

export const KANBAN_COLUMNS = ['backlog', 'todo', 'in_progress', 'review', 'done'] as const

export const WIP_LIMITS: Record<string, number> = {
  in_progress: 5,
  review: 3,
}

export const DATE_FORMAT = 'MMM d, yyyy'
