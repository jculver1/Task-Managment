import { useTasks } from '../context/TaskContext'

function ListItem({
  task: {
    id,
    title = '',
    description = '',
    createdAt = '',
  } = {},
}: {
  task?: any
}) {
  const { deleteTask } = useTasks()

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

  return (
    <li className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-sm shadow-slate-950/10 transition hover:border-sky-500/30 hover:bg-slate-900/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-slate-500 sm:text-sm">
            <p>Created</p>
            <p className="mt-1 font-medium text-slate-300">{createdAtDisplay}</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  )
}

export default ListItem