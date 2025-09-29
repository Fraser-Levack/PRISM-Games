import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Credits from './pages/Credits'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/credits" element={<Credits />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
