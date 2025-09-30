import { Link } from 'react-router-dom'
import IsometricRenderer from '../../components/isometricGrid/IsometricRenderer'
import { CubeGrid } from '../../components/isometricGrid/Grid'

const Chicken_Crossing = () => {
  // Create a sample cube grid
  const cubeGrid = new CubeGrid();
  
  // Add some sample cubes
  cubeGrid.addCube(0, 0, 0x00ff00, 'ground');    // Green cube at origin
  cubeGrid.addCube(0, 1, 0x00ff00, 'ground');
  cubeGrid.addCube(1, 0, 0x00ff00, 'ground');
  cubeGrid.addCube(0, 2, 0x00ff00, 'ground');
  cubeGrid.addCube(0, 3, 0x00ff00, 'ground');
  cubeGrid.addCube(1, 2, 0x00ff00, 'ground');
  

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
      }}>
        <IsometricRenderer cubeGrid={cubeGrid} />
      </div>
    </div>
  )
}

export default Chicken_Crossing
