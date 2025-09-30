import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Credits from './pages/Credits'
import Games from './pages/Games'
import GeometricBackground from './components/GeometricBackground'
import './App.css'
import Chicken_Crossing from './pages/Games/ChickenCrossing/ChickenCrossingGame'

// Component to conditionally render background based on route
function ConditionalBackground() {
  const location = useLocation()
  const [showBackground, setShowBackground] = useState(true)

  useEffect(() => {
    // Hide background on actual game routes
    const isGameRoute = location.pathname.startsWith('/games/') && location.pathname !== '/games'
    setShowBackground(!isGameRoute)
  }, [location.pathname])

  return showBackground ? <GeometricBackground /> : null
}

function App() {
  return (
    <Router>
      <ConditionalBackground />
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
