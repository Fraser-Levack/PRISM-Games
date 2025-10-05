import { Link } from 'react-router-dom';

const Credits = () => {
  return (
    <div className="credits">
      <h1>Credits</h1>
      <div className="credits-content">
        <h2>Development Team</h2>
        <ul>
          <li>Fraser Levack - Lead Developer</li>
        </ul>
        
        <h2>Technologies Used</h2>
        <ul>
          <li>React</li>
          <li>TypeScript</li>
          <li>Vite</li>
          <li>React Router</li>
          <li>Three.js</li>
          <li>PRISM Model Checker</li>
        </ul>
      </div>
      
      <div className="navigation">
        <Link to="/" className="nav-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Credits;