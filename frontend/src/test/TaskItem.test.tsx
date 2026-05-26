import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TaskItem from '../components/TaskItem'
import { useTasks } from '../context/TaskContext'

vi.mock('../context/TaskContext')

const mockUpdateTask = vi.fn()
const mockDeleteTask = vi.fn()

const baseTask = {
  id: '1',
  title: 'Buy groceries',
  description: 'Milk and eggs',
  isComplete: false,
  createdAt: '2024-01-15T10:00:00.000Z',
}

beforeEach(() => {
  vi.mocked(useTasks).mockReturnValue({
    tasks: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
    createTask: vi.fn(),
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
  })
  mockUpdateTask.mockReset()
  mockDeleteTask.mockReset()
})

describe('TaskItem — display', () => {
  it('renders the task title and description', () => {
    render(<TaskItem task={baseTask} />)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Milk and eggs')).toBeInTheDocument()
  })

  it('renders without a description', () => {
    render(<TaskItem task={{ ...baseTask, description: undefined }} />)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })

  it('renders formatted created date', () => {
    render(<TaskItem task={baseTask} />)
    expect(screen.getByText(/Jan/)).toBeInTheDocument()
  })

  it('shows "Mark Complete" for an incomplete task', () => {
    render(<TaskItem task={baseTask} />)
    expect(screen.getByRole('button', { name: 'Mark Complete' })).toBeInTheDocument()
  })

  it('shows "Mark Incomplete" for a completed task', () => {
    render(<TaskItem task={{ ...baseTask, isComplete: true }} />)
    expect(screen.getByRole('button', { name: 'Mark Incomplete' })).toBeInTheDocument()
  })

  it('applies line-through style to title when completed', () => {
    render(<TaskItem task={{ ...baseTask, isComplete: true }} />)
    expect(screen.getByText('Buy groceries')).toHaveClass('line-through')
  })
})

describe('TaskItem — complete toggle', () => {
  it('calls updateTask with isComplete: true when marking complete', async () => {
    mockUpdateTask.mockResolvedValue(undefined)
    render(<TaskItem task={baseTask} />)
    await userEvent.click(screen.getByRole('button', { name: 'Mark Complete' }))
    expect(mockUpdateTask).toHaveBeenCalledWith('1', expect.objectContaining({ isComplete: true }))
  })

  it('calls updateTask with isComplete: false when marking incomplete', async () => {
    mockUpdateTask.mockResolvedValue(undefined)
    render(<TaskItem task={{ ...baseTask, isComplete: true }} />)
    await userEvent.click(screen.getByRole('button', { name: 'Mark Incomplete' }))
    expect(mockUpdateTask).toHaveBeenCalledWith('1', expect.objectContaining({ isComplete: false }))
  })
})

describe('TaskItem — edit', () => {
  it('clicking Edit shows title and description inputs pre-filled from DB values', async () => {
    render(<TaskItem task={baseTask} />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByDisplayValue('Buy groceries')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Milk and eggs')).toBeInTheDocument()
  })

  it('saves updated title and description', async () => {
    mockUpdateTask.mockResolvedValue(undefined)
    render(<TaskItem task={baseTask} />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const titleInput = screen.getByDisplayValue('Buy groceries')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Walk the dog')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateTask).toHaveBeenCalledWith('1', expect.objectContaining({ title: 'Walk the dog' })),
    )
  })

  it('does not call updateTask when title is blank', async () => {
    render(<TaskItem task={baseTask} />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const titleInput = screen.getByDisplayValue('Buy groceries')
    await userEvent.clear(titleInput)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(mockUpdateTask).not.toHaveBeenCalled()
  })

  it('omits description from payload when description is cleared', async () => {
    mockUpdateTask.mockResolvedValue(undefined)
    render(<TaskItem task={baseTask} />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.clear(screen.getByDisplayValue('Milk and eggs'))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(mockUpdateTask).toHaveBeenCalledWith('1', { title: 'Buy groceries' }),
    )
  })

  it('Cancel restores original values and exits edit mode', async () => {
    render(<TaskItem task={baseTask} />)
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const titleInput = screen.getByDisplayValue('Buy groceries')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Something else')
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
  })
})

describe('TaskItem — delete', () => {
  it('calls deleteTask with the task id', async () => {
    mockDeleteTask.mockResolvedValue(undefined)
    render(<TaskItem task={baseTask} />)
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(mockDeleteTask).toHaveBeenCalledWith('1')
  })
})
