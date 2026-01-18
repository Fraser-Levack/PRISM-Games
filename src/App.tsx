import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Credits from './pages/Credits'
import Games from './pages/Games'
import GeometricBackground from './components/GeometricBackground'
import './App.css'
import Chicken_Crossing from './pages/Games/ChickenCrossing/ChickenCrossingGame'
import TowerOfHanoiGame from './pages/Games/TowerOfHanoi/TowerOfHanoiGame'
import ShutTheBoxGame from './pages/Games/ShutTheBox/ShutTheBoxGame'
import NavBar from './components/NavBar'
import Solutions from './pages/solutions/Solutions'

// Component to conditionally render background based on route
function ConditionalBackground() {
  const location = useLocation()
  const [showBackground, setShowBackground] = useState(true)

  useEffect(() => {
    // Hide background on actual game routes and solutions route
    const isGameRoute = location.pathname.startsWith('/games/') && location.pathname !== '/games'
    const isSolutionsRoute = location.pathname.startsWith('/solutions')
    setShowBackground(!isGameRoute && !isSolutionsRoute)
  }, [location.pathname])

  return showBackground ? <GeometricBackground /> : null
}

function App() {
  return (
    <Router>
      <NavBar />
      <ConditionalBackground />
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/chicken_crossing" element={<Chicken_Crossing />} />
          <Route path="/games/tower_of_hanoi" element={<TowerOfHanoiGame />} />
          <Route path="/games/shut_the_box" element={<ShutTheBoxGame />} />
          <Route path="/solutions" element={<Solutions />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
