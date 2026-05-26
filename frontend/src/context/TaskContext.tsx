import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

type Task = {
  id: string
  title: string
  description?: string
  isComplete: boolean
  createdAt: string
}

type TaskContextValue = {
  tasks: Task[]
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  createTask: (task: { title: string; description?: string }) => Promise<void>
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined)

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Task[]>('/api/tasks')
      setTasks(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchTasks()
  }, [])

  const createTask = async ({ title, description }: { title: string; description?: string }) => {
    try {
      const newTask = await api.post<Task>('/api/tasks', { title, ...(description ? { description } : {}) })
      setTasks((prev) => [newTask, ...prev])
    } catch (err: any) {
      setError(err)
      throw err
    }
  }

  const updateTask = async (
    id: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>,
  ) => {
    const previousTasks = tasks
    setTasks((prev) =>
      prev.map((task) =>
        String(task.id) === String(id) ? { ...task, ...updates } : task,
      ),
    )
    try {
      await api.put<Task>(`/api/tasks/${id}`, updates)
    } catch (err: any) {
      setError(err)
      setTasks(previousTasks)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    const previousTasks = tasks
    setTasks((prev) => prev.filter((task) => String(task.id) !== String(id)))
    try {
      await api.del(`/api/tasks/${id}`)
    } catch (err: any) {
      setError(err)
      setTasks(previousTasks)
      throw err
    }
  }

  const value: TaskContextValue = {
    tasks,
    loading,
    error,
    refresh: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export const useTasks = () => {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider')
  return ctx
}

export default TaskContext
