type Json = Record<string, any> | Array<any> | string | number | boolean | null

const baseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isAbsolute = /^(https?:)?\/\//i.test(path)
  const url = isAbsolute ? path : path.startsWith('/api') ? path : `${baseUrl}/${path.replace(/^\//, '')}`

  const headers = new Headers(init.headers || {})
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, { ...init, headers })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(`${res.status} ${res.statusText}: ${text}`)
    throw err
  }

  if (res.status === 204) return null as unknown as T
  const contentType = res.headers.get('Content-Type') || ''
  if (contentType.includes('application/json')) return (await res.json()) as T
  return (await res.text()) as unknown as T
}

export function get<T = any>(path: string) {
  return request<T>(path, { method: 'GET' })
}

export function post<T = any>(path: string, data?: Json) {
  const body = data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined
  return request<T>(path, { method: 'POST', body })
}

export function put<T = any>(path: string, data?: Json) {
  const body = data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined
  return request<T>(path, { method: 'PUT', body })
}

export function del<T = any>(path: string) {
  return request<T>(path, { method: 'DELETE' })
}

const api = { get, post, put, del }
export default api
