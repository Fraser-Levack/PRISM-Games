import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Credits from './pages/Credits'
import Games from './pages/Games'
import GeometricBackground from './components/GeometricBackground'
import './App.css'
import Chicken_Crossing from './pages/Games/Chicken_Crossing'

function App() {
  return (
    <Router>
      <GeometricBackground />
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/chicken_crossing" element={<Chicken_Crossing />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
