// import { Link } from 'react-router-dom';
import '../styles/Home.css';
import GameCard from '../components/GameCard';

const Home = () => {
  return (
    
    <div className="home">
      <div className="top-section">
      <h1>PRISM Games</h1>
      <h2>Learn about the World of</h2>
      <h2>Model Checking</h2>
      <div className="description">
        <p><strong>Improve your skills by playing games</strong></p>
        <p><strong>and understand the power of model checking.</strong></p>
      </div>
      </div>
      <div className='game-cards-title'>
        <h2>Available Games</h2>
      </div>
      <div className="desktop-only-message">
        <p>🖥️ Games are available on desktop devices only</p>
        <p>Please visit this site on a laptop or PC to play</p>
      </div>
      <div className="game-cards">
        <GameCard title="Chicken Crossing" imageSrc="/Icons/Chicken_Icon.png" link="/games/chicken_crossing">
          <p>Classic puzzle, move all the farmers items across the river. | difficulty: <span style={{color:"green"}}>Easy</span></p>
        </GameCard>
        <GameCard title="Tower of Hanoi" imageSrc="/Icons/Tower_Icon.png" link="/games/tower_of_hanoi">
          <p>Move all the tower disks from the source peg to the target peg. | difficulty: <span style={{color:"orange"}}>Medium</span></p>
        </GameCard>
        <GameCard title="Shut the Box" imageSrc="/Icons/Dice_Icon.png" link="/games/shut_the_box">
          <p>Roll the dice and shut the numbered tiles in the most optimal order. | difficulty: <span style={{color:"red"}}>Hard</span></p>
        </GameCard>
      </div>
    </div>
  );
};

export default Home;