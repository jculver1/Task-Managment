import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../App'
import { useTasks } from '../context/TaskContext'

vi.mock('../context/TaskContext')
vi.mock('../components/AddTask', () => ({ default: () => <div>AddTask</div> }))

const baseContext = {
  tasks: [],
  loading: false,
  error: null,
  refresh: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}

beforeEach(() => {
  vi.mocked(useTasks).mockReturnValue(baseContext)
})

describe('App', () => {
  it('shows a loading indicator while tasks are loading', () => {
    vi.mocked(useTasks).mockReturnValue({ ...baseContext, loading: true })
    render(<App />)
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument()
  })

  it('shows an error message when loading fails', () => {
    vi.mocked(useTasks).mockReturnValue({ ...baseContext, error: new Error('Failed') })
    render(<App />)
    expect(screen.getByText('Error loading tasks.')).toBeInTheDocument()
  })

  it('renders a task item for each task', () => {
    vi.mocked(useTasks).mockReturnValue({
      ...baseContext,
      tasks: [
        { id: '1', title: 'First task', isComplete: false, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', title: 'Second task', isComplete: false, createdAt: '2024-01-02T00:00:00.000Z' },
      ],
    })
    render(<App />)
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('Second task')).toBeInTheDocument()
  })

  it('renders an empty list when there are no tasks', () => {
    render(<App />)
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })
})
