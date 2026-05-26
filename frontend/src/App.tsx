import './App.css'
import AddTask from './components/AddTask'
import ListItem from './components/ListItem'
import { useTasks } from './context/TaskContext'

function App() {
  const { tasks, loading, error } = useTasks()

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-[0_45px_100px_-45px_rgba(15,23,42,0.8)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Tasks</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Add a task title and description, then press Create Task.
            </p>
          </div>
        </div>

        <AddTask />
      </section>

      {loading ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-10 text-center text-sm text-slate-400">
          Loading tasks...
        </div>
      ) : error ? (
        <div className="rounded-[1.75rem] border border-rose-500/20 bg-rose-500/5 p-10 text-center text-sm text-rose-300">
          Error loading tasks.
        </div>
      ) : (
        <ul role="list" className="space-y-4">
          {tasks.map((task: any) => (
            <ListItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
