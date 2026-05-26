import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

type Task = any

type TaskContextValue = {
  tasks: Task[]
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchTasks()
  }, [])

  const value: TaskContextValue = {
      tasks,
      loading,
      error,
      refresh: function (): Promise<void> {
          throw new Error('Function not implemented.')
      }
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export const useTasks = () => {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used within a TaskProvider')
  return ctx
}

export default TaskContext
