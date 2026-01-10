import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Only keep routes for components that actually exist */}
        <Route path="/" element={<Landing />} />
      </Routes>
    </div>
  )
}

export default App