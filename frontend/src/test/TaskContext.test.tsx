import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TaskProvider, useTasks } from '../context/TaskContext'
import * as api from '../lib/api'

vi.mock('../lib/api')

const task1 = { id: '1', title: 'First', isComplete: false, createdAt: '2024-01-01T00:00:00.000Z' }
const task2 = { id: '2', title: 'Second', isComplete: false, createdAt: '2024-01-02T00:00:00.000Z' }

beforeEach(() => {
  vi.resetAllMocks()
})

function wrapper({ children }: { children: React.ReactNode }) {
  return <TaskProvider>{children}</TaskProvider>
}

describe('TaskContext', () => {
  it('fetches tasks on mount and exposes them', async () => {
    vi.mocked(api.get).mockResolvedValue([task1, task2])
    const { result } = renderHook(() => useTasks(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tasks).toEqual([task1, task2])
  })

  it('sets error state when fetch fails', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useTasks(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.tasks).toEqual([])
  })

  it('createTask prepends the new task to the list', async () => {
    const newTask = { id: '3', title: 'New', isComplete: false, createdAt: '2024-01-03T00:00:00.000Z' }
    vi.mocked(api.get).mockResolvedValue([task1])
    vi.mocked(api.post).mockResolvedValue(newTask)
    const { result } = renderHook(() => useTasks(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.createTask({ title: 'New' }))
    expect(result.current.tasks[0]).toEqual(newTask)
  })

  it('updateTask optimistically updates the task', async () => {
    vi.mocked(api.get).mockResolvedValue([task1])
    vi.mocked(api.put).mockResolvedValue({ ...task1, title: 'Updated' })
    const { result } = renderHook(() => useTasks(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.updateTask('1', { title: 'Updated' }))
    expect(result.current.tasks[0].title).toBe('Updated')
  })

  it('updateTask rolls back on API failure', async () => {
    vi.mocked(api.get).mockResolvedValue([task1])
    vi.mocked(api.put).mockRejectedValue(new Error('Server error'))
    const { result } = renderHook(() => useTasks(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await expect(act(() => result.current.updateTask('1', { title: 'Bad update' }))).rejects.toThrow()
    expect(result.current.tasks[0].title).toBe('First')
  })

  it('deleteTask removes the task optimistically', async () => {
    vi.mocked(api.get).mockResolvedValue([task1, task2])
    vi.mocked(api.del).mockResolvedValue(null)
    const { result } = renderHook(() => useTasks(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.deleteTask('1'))
    expect(result.current.tasks).toHaveLength(1)
    expect(result.current.tasks[0].id).toBe('2')
  })

  it('deleteTask rolls back on API failure', async () => {
    vi.mocked(api.get).mockResolvedValue([task1, task2])
    vi.mocked(api.del).mockRejectedValue(new Error('Server error'))
    const { result } = renderHook(() => useTasks(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await expect(act(() => result.current.deleteTask('1'))).rejects.toThrow()
    expect(result.current.tasks).toHaveLength(2)
  })
})
