import {Link} from "react-router-dom";

const Chicken_Crossing = () => {
    return (
        <div className="game-page">
            <h1>Chicken Crossing</h1>
            <p>Help the chicken cross the road safely!</p>
            <div className="navigation">
                <Link to="/games" className="nav-link">Back to Games</Link>
            </div>
        </div>
    )
}

export default Chicken_Crossing;
