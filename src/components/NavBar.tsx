import { NavLink, useLocation } from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {
  const location = useLocation()
  // hide navbar on actual game routes if you want a focused game view
  const hideOnGame = location.pathname.startsWith('/games/') && location.pathname !== '/games'
  if (hideOnGame) return null

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/">
        <div className="brand">
            
            
            <div className='logo'>
                <img src="/prism-logo.svg" alt="PRISM Logo" className="logo-image" />
          </div>
          PRISM Games
          
        </div>
        </NavLink>
        <div className="nav-links">
          <NavLink to="/games" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Games
          </NavLink>
          <NavLink to="/credits" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Credits
          </NavLink>
        </div>
      </div>
    </nav>
  )
}