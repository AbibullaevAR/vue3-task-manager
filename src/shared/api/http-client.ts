import { API_BASE } from '@/shared/config/constants'

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
    throw new HttpError(error.message || `HTTP ${response.status}`, response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}
