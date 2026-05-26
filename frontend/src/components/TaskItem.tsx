import { useState } from 'react'
import { useTasks } from '../context/TaskContext'

function TaskItem({
  task: {
    id,
    title,
    description,
    isComplete,
    createdAt,
  },
}: {
  task: {
    id: string
    title: string
    description?: string
    isComplete: boolean
    createdAt: string
  }
}) {
  const { deleteTask, updateTask } = useTasks()
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(title)
  const [draftDescription, setDraftDescription] = useState(description)
  const [isSaving, setIsSaving] = useState(false)


  const createdAtDate = createdAt ? new Date(createdAt) : null
  const createdAtDisplay = createdAtDate && !Number.isNaN(createdAtDate.getTime())
    ? createdAtDate.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown'

  const handleDelete = async () => {
    try {
      await deleteTask(String(id))
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const completeTask = async () => {
    try {
      await updateTask(String(id), { 
        title: title,
        description: description,
        isComplete: !isComplete,
      })
    } catch (err) {
      console.error('Toggle complete failed', err)
    } 
  }

  const handleSave = async () => {
    if (!draftTitle.trim()) return
    setIsSaving(true) 
    try {
      await updateTask(String(id), {
        title: draftTitle.trim(),
        ...(draftDescription?.trim() ? { description: draftDescription.trim() } : {}),
      })
      setIsEditing(false)
    } catch (err) {
      console.error('Save failed', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <li className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-sm shadow-slate-950/10 transition hover:border-sky-500/30 hover:bg-slate-900/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200" htmlFor={`task-title-${id}`}>
                  Title
                </label>
                <input
                  id={`task-title-${id}`}
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200" htmlFor={`task-description-${id}`}>
                  Description
                </label>
                <textarea
                  id={`task-description-${id}`}
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <>
              <p className={`text-base font-semibold ${isComplete ? 'text-sky-300 line-through' : 'text-white'}`}>
                {title}
              </p>
              <p className={`mt-2 text-sm leading-6 ${isComplete ? 'text-slate-500 line-through' : 'text-slate-400'}`}>
                {description}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <div className="text-right text-xs text-slate-500 sm:text-sm">
            <p>{isComplete ? 'Completed' : 'Created'}</p>
            <p className="mt-1 font-medium text-slate-300">{createdAtDisplay}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={completeTask}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                isComplete
                  ? 'border border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border border-sky-500/30 bg-sky-500/10 text-sky-200 hover:bg-sky-500/15'
              }`}
            >
              {isComplete ? 'Mark Incomplete' : 'Mark Complete'}
            </button>

            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftTitle(title)
                    setDraftDescription(description)
                    setIsEditing(false)
                  }}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={handleDelete}
              className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

export default TaskItem