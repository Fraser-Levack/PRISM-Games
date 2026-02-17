import { Link } from 'react-router-dom';
import '../styles/Credits.css';

const Credits = () => {
  return (
    <div className="credits">
      <h1>Credits</h1>
      <div className="credits-content">
        <h2>Development </h2>
        <ul>
          <li><strong>Fraser Levack</strong> - Lead Developer</li>
        </ul>

        <p> Many thanks to <strong>Professor Gethin Norman</strong> 
          <br></br>for his continued support and guidance 
          <br></br>throughout the development of this project.
        </p>
        
        <h2>Technologies Used</h2>
        <ul>
          <li>React</li>
          <li>TypeScript</li>
          <li>Vite</li>
          <li>Three.js</li>
          <li>PRISM Model Checker</li>
        </ul>
      </div>

      <div className="bottom-links">
      <a href="https://www.prismmodelchecker.org/" target="_blank" rel="noopener noreferrer" className="nav-link">
        Visit PRISM Model Checker
      </a>
      
      <div className="navigation">
        <Link to="/" className="nav-link">
          Back to Home
        </Link>
      </div>
      </div>
    </div>
  );
};

export default Credits;