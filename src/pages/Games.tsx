import {Link} from "react-router-dom";

const Games = () => {
  return (
    <div className="games">
        <h1>Games Page</h1>
        <p>Here are some of our games:</p>
        
        <div className="navigation">
        <Link to="/games/chicken_crossing" className="nav-link">Chicken Crossing</Link>

        <Link to="/" className="nav-link">Back to Home</Link>
        </div>
    </div>
  )
}

export default Games
