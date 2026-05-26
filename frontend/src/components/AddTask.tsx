import { type SubmitEvent, useState } from 'react'
import { useTasks } from '../context/TaskContext'

function AddTask() {
  const { createTask } = useTasks()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      setFormError('Task title is required.')
      return
    }

    setFormError(null)
    setSubmitting(true)

    try {
      await createTask({ title: title.trim(), description: description.trim() })
      setTitle('')
      setDescription('')
    } catch (err) {
      setFormError('Could not create task. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/20">
      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor="task-title">
              Title
            </label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              placeholder="Write a task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200" htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              placeholder="Describe the task"
              rows={4}
            />
          </div>
        </div>

        <div className="flex items-end justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-14 items-center justify-center rounded-3xl bg-sky-500 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </form>

      {formError && <p className="mt-4 text-sm text-rose-400">{formError}</p>}
    </div>
  )
}

export default AddTask
