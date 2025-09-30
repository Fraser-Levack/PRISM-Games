import { Link } from 'react-router-dom'

const Chicken_Crossing = () => {
  return (
    <div className="game-container">
      {/* Back to games button */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 100 
      }}>
        <Link 
          to="/games" 
          className="nav-link"
          style={{ 
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          ← Back to Games
        </Link>
      </div>
      
      {/* Game content */}
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '2rem'
      }}>
        <h1>Chicken Crossing Game</h1>
        {/* Your game implementation goes here */}
      </div>
    </div>
  )
}

export default Chicken_Crossing
