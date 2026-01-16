import { NavLink} from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {

  const GITHUB_URL = 'https://github.com/Fraser-Levack/PRISM-Games'

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
          {/* <NavLink to="/games" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Games
          </NavLink> */}
          <NavLink to="/solutions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Solutions
          </NavLink>

          <NavLink to="/credits" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Credits
          </NavLink>
        
        <span className="separator" aria-hidden="true">|</span>

        {/* pipe and GitHub link */}
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