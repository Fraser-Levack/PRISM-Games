import { NavLink} from 'react-router-dom'
import { useState } from 'react'
import './NavBar.css'

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const GITHUB_URL = 'https://github.com/Fraser-Levack/PRISM-Games'
  const SURVEY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLScH4Qcb0SSLuUC5OM72SnHbtdfiFBCuSK_n26nhRJcYlZjBXQ/viewform?usp=header'

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

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
        
        <button 
          className="hamburger" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink 
            to="/solutions" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Solutions
          </NavLink>

          <div className="nav-external" aria-hidden={false}>
          <a
            className="nav-link"
            href={SURVEY_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open survey link"
          >
            Survey
            </a>
          </div>

          <NavLink 
            to="/credits" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            Credits
          </NavLink>
        
        <span className="separator" aria-hidden="true">|</span>

        <div className="nav-external" aria-hidden={false}>
          <a
            className="github-link"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open project on GitHub"
          >
            <img src="/github-mark.svg" alt="GitHub" className="github-icon" style={{ width: '2rem', height: '2rem', marginTop: '0.4rem' }} />
          </a>
          </div>
        </div>
      </div>
    </nav>
  )
}