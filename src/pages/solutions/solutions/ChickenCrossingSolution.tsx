import '../SolutionContent.css';

interface ChickenCrossingSolutionProps {
  gameId: string;
}

export default function ChickenCrossingSolution({
  gameId,
}: ChickenCrossingSolutionProps) {
  const sectionId = (id: string) => `${gameId}-${id}`;

  return (
    <div className="solution-content">
      <h1>Chicken Crossing Solution</h1>

      <section
        id={sectionId('overview')}
        data-section-id="overview"
        className="solution-section"
      >
        <h2>Overview</h2>
        <p>
          Chicken Crossing is a classic game where the player must guide a
          chicken across a busy road while avoiding traffic. The challenge
          involves timing and movement coordination.
        </p>
        <h3>Objective</h3>
        <p>
          Navigate the chicken from the bottom of the screen to the top,
          avoiding cars and obstacles. Each successful crossing increases the
          difficulty.
        </p>
        <h3>Key Features</h3>
        <ul>
          <li>Progressive difficulty levels</li>
          <li>Multiple lanes with varying traffic patterns</li>
          <li>Collision detection system</li>
          <li>Score tracking and high scores</li>
        </ul>
      </section>

      <section
        id={sectionId('algorithm')}
        data-section-id="algorithm"
        className="solution-section"
      >
        <h2>Core Algorithm</h2>
        <h3>Game Loop</h3>
        <p>The game operates on a main loop that handles:</p>
        <ol>
          <li>Input processing (keyboard/touch controls)</li>
          <li>Entity movement (chicken and vehicles)</li>
          <li>Collision detection</li>
          <li>Rendering and UI updates</li>
        </ol>

        <h3>Collision Detection</h3>
        <p>
          Uses bounding box collision detection to determine if the chicken has
          collided with a vehicle or reached the goal.
        </p>

        <h3>Difficulty Progression</h3>
        <p>
          As the player progresses, the algorithm increases vehicle speed and
          frequency, making the game progressively harder.
        </p>
      </section>

      <section
        id={sectionId('implementation')}
        data-section-id="implementation"
        className="solution-section"
      >
        <h2>Technical Structure</h2>

        <h3>Components</h3>
        <ul>
          <li>
            <strong>ChickenCrossingGame:</strong> Main game component
          </li>
          <li>
            <strong>GameStateManager:</strong> Manages game state and logic
          </li>
          <li>
            <strong>GameStatusPopup:</strong> Displays game status messages
          </li>
          <li>
            <strong>Tutorial:</strong> Provides game instructions
          </li>
        </ul>

        <h3>State Management</h3>
        <p>
          Uses React hooks to manage game state, including chicken position,
          vehicle positions, score, and game status.
        </p>

        <h3>Rendering</h3>
        <p>
          The game uses Canvas or Three.js for rendering game entities and the
          game world.
        </p>
      </section>

      <section
        id={sectionId('codeWalkthrough')}
        data-section-id="codeWalkthrough"
        className="solution-section"
      >
        <h2>Key Code Sections</h2>

        <h3>Game State Manager</h3>
        <p>
          The GameStateManager handles all game logic including movement,
          collision detection, and score tracking.
        </p>

        <h3>Collision Detection Logic</h3>
        <pre className="code-block">
{`function checkCollision(chicken, vehicles) {
  for (let vehicle of vehicles) {
    if (
      chicken.x < vehicle.x + vehicle.width &&
      chicken.x + chicken.width > vehicle.x &&
      chicken.y < vehicle.y + vehicle.height &&
      chicken.y + chicken.height > vehicle.y
    ) {
      return true;
    }
  }
  return false;
}`}
        </pre>

        <h3>Game Loop</h3>
        <p>
          The main game loop updates entity positions, checks for collisions,
          and renders the game state.
        </p>
      </section>
    </div>
  );
}
