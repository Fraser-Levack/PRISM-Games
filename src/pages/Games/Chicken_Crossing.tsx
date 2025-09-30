import { Link } from 'react-router-dom'
import IsometricRenderer from '../../components/isometricGrid/IsometricRenderer'
import { CubeGrid } from '../../components/isometricGrid/Grid'

const Chicken_Crossing = () => {
  // Create a sample cube grid
  const cubeGrid = new CubeGrid();
  
  // Add some sample cubes
  // Bigger grid dimensions
  const gridWidth = 20;
  const gridHeight = 12;
  const riverStart = 3;
  const riverEnd = gridWidth - 4;
  const riverWidth = 6; // Wider river

  // Center the grid over (0, 0)
  const xOffset = -Math.floor(gridWidth / 2);
  const yOffset = -Math.floor(gridHeight / 2);

  // Fill the grid with ground first
  for (let x = 0; x < gridWidth; x++) {
    for (let y = 0; y < gridHeight; y++) {
      cubeGrid.addCube(x + xOffset, y + yOffset, 0x00ff00, 'ground');
    }
  }

  // River (center, meandering, overwrite ground with water)
  for (let y = 0; y < gridHeight; y++) {
    // Sine wave meander for river center
    const meander = Math.round(Math.sin(y / 2.5) * 2); // -2 to 2
    // Center of river for this row
    const riverCenter = Math.floor((riverStart + riverEnd) / 2) + meander;
    for (let x = riverStart; x < riverEnd; x++) {
      // Fill river cubes
      if (Math.abs(x - riverCenter) <= Math.floor(riverWidth / 2)) {
        cubeGrid.removeCube(x + xOffset, y + yOffset);
        cubeGrid.addCube(x + xOffset, y + yOffset, 0x3399ff, 'water');
        
      }
    }
  }
  


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
