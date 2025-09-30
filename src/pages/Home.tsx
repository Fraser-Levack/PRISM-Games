import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to PRISM Games</h1>
      <p>This is a Vite + React + TypeScript application with routing.</p>
      <div className="navigation">
        <Link to="/games" className="nav-link">
          View Games
        </Link>
        <Link to="/credits" className="nav-link">
          View Credits
        </Link>
      </div>
    </div>
  );
};

export default Home;