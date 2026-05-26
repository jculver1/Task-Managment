import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddTask from '../components/AddTask'
import { useTasks } from '../context/TaskContext'

vi.mock('../context/TaskContext')

const mockCreateTask = vi.fn()

beforeEach(() => {
  vi.mocked(useTasks).mockReturnValue({
    tasks: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
    createTask: mockCreateTask,
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  })
  mockCreateTask.mockReset()
})

describe('AddTask', () => {
  it('renders title and description inputs and submit button', () => {
    render(<AddTask />)
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument()
  })

  it('shows a validation error when submitted without a title', async () => {
    render(<AddTask />)
    await userEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    expect(screen.getByText('Task title is required.')).toBeInTheDocument()
    expect(mockCreateTask).not.toHaveBeenCalled()
  })

  it('calls createTask with title only when description is empty', async () => {
    mockCreateTask.mockResolvedValue(undefined)
    render(<AddTask />)
    await userEvent.type(screen.getByLabelText('Title'), 'Buy groceries')
    await userEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    await waitFor(() => expect(mockCreateTask).toHaveBeenCalledWith({ title: 'Buy groceries', description: '' }))
  })

  it('calls createTask with both title and description', async () => {
    mockCreateTask.mockResolvedValue(undefined)
    render(<AddTask />)
    await userEvent.type(screen.getByLabelText('Title'), 'Buy groceries')
    await userEvent.type(screen.getByLabelText('Description'), 'Milk and eggs')
    await userEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    await waitFor(() =>
      expect(mockCreateTask).toHaveBeenCalledWith({ title: 'Buy groceries', description: 'Milk and eggs' }),
    )
  })

  it('clears the form after successful submission', async () => {
    mockCreateTask.mockResolvedValue(undefined)
    render(<AddTask />)
    const titleInput = screen.getByLabelText('Title')
    const descriptionInput = screen.getByLabelText('Description')
    await userEvent.type(titleInput, 'Buy groceries')
    await userEvent.type(descriptionInput, 'Milk and eggs')
    await userEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    await waitFor(() => {
      expect(titleInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })
  })

  it('shows an error message when createTask throws', async () => {
    mockCreateTask.mockRejectedValue(new Error('Network error'))
    render(<AddTask />)
    await userEvent.type(screen.getByLabelText('Title'), 'Buy groceries')
    await userEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    await waitFor(() =>
      expect(screen.getByText('Could not create task. Please try again.')).toBeInTheDocument(),
    )
  })

  it('disables the button and shows "Creating…" while submitting', async () => {
    let resolve: () => void
    mockCreateTask.mockReturnValue(new Promise<void>((r) => { resolve = r }))
    render(<AddTask />)
    await userEvent.type(screen.getByLabelText('Title'), 'Buy groceries')
    await userEvent.click(screen.getByRole('button', { name: 'Create Task' }))
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled()
    resolve!()
  })
})
