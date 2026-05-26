import './App.css'
import ListItem from './components/ListItem'
import { useTasks } from './context/TaskContext'

function App() {
  const { tasks, loading, error } = useTasks()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading tasks</div>

  return (
    <>
      <ul role="list" className="divide-y divide-white/5">
        {tasks.map((task: any) => (
          <ListItem key={task.id} task={task} />
        ))}
      </ul>
    </>
  )
}

export default App
