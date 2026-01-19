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
          The Chicken Crossing game is based on the classic "Farmer, Fox, Chicken, and Grain" river crossing puzzle. 
          A farmer must transport a fox, a chicken, and a sack of grain across a river using a small boat. 
          The challenge lies in the constraints and conflicts between the items.
        </p>
        <h3>Objective</h3>
        <p>
          Successfully transport all three items (fox, chicken, and grain) from the left side of the river to the right side, 
          ensuring that no forbidden combinations are left unattended.
        </p>
        <h3>Game Constraints</h3>
        <ul>
          <li>The boat can only carry the farmer and at most one item at a time</li>
          <li>If the fox and chicken are left alone together, the fox will eat the chicken (loss condition)</li>
          <li>If the chicken and grain are left alone together, the chicken will eat the grain (loss condition)</li>
          <li>The farmer must be present to prevent these conflicts</li>
        </ul>
      </section>

      <section
        id={sectionId('algorithm')}
        data-section-id="algorithm"
        className="solution-section"
      >
        <h2>Solution Strategy</h2>
        <h3>Optimal Solution</h3>
        <p>The puzzle can be solved in 7 moves (boat crossings):</p>
        <ol>
          <li>Take the chicken across to the right side</li>
          <li>Return alone to the left side</li>
          <li>Take the fox across to the right side</li>
          <li>Bring the chicken back to the left side</li>
          <li>Take the grain across to the right side</li>
          <li>Return alone to the left side</li>
          <li>Take the chicken across to the right side</li>
        </ol>

        <h3>Key Insight</h3>
        <p>
          The critical strategy is to take the chicken first and bring it back on the return trip 
          when transporting either the fox or grain. This ensures the chicken is never left alone 
          with its predator (fox) or prey (grain).
        </p>

        <h3>Win/Loss Conditions</h3>
        <p>
          The game continuously checks two conditions: (1) Win if all items and the player are on the right side, 
          (2) Loss if fox and chicken are together without the player, or if chicken and grain are together without the player.
        </p>
      </section>

      <section
        id={sectionId('implementation')}
        data-section-id="implementation"
        className="solution-section"
      >
        <h2>Technical Implementation</h2>

        <h3>Components</h3>
        <ul>
          <li>
            <strong>ChickenCrossingGame:</strong> Main game component managing the isometric grid view
          </li>
          <li>
            <strong>GameStateManager:</strong> Central state manager handling player movement, object interactions, and game logic
          </li>
          <li>
            <strong>GameStatusPopup:</strong> Displays win/loss messages with appropriate feedback
          </li>
          <li>
            <strong>Tutorial:</strong> Interactive step-by-step guide through the puzzle solution
          </li>
        </ul>

        <h3>State Management</h3>
        <p>
          The game maintains state for player position, object positions (fox, chicken, grain, boat), 
          which items are on the left vs. right side of the river, what the player is holding, 
          and the current game status (playing, won, lost, paused).
        </p>

        <h3>Rendering</h3>
        <p>
          The game uses Three.js with an isometric camera view to render the 3D game world, 
          including the river, ground terrain, decorative elements (trees, barn, fences), 
          and interactive game objects with custom models.
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
          The GameStateManager handles all game logic including player movement, 
          object pickup/drop mechanics, boat sailing, and win/loss condition checking.
        </p>

        <h3>Win/Loss Condition Checking</h3>
        <pre className="code-block">
{`// Win condition: All entities on the right side
const requiredEntities = ['player', 'fox', 'chicken', 'grain'];
const allOnRight = requiredEntities.every(entity => right.includes(entity));

// Loss conditions:
// 1. Chicken and grain together without player
const chickenAndGrainAlone = 
  (left.includes('chicken') && left.includes('grain') && !left.includes('player')) ||
  (right.includes('chicken') && right.includes('grain') && !right.includes('player'));

// 2. Fox and chicken together without player
const foxAndChickenAlone = 
  (left.includes('fox') && left.includes('chicken') && !left.includes('player')) ||
  (right.includes('fox') && right.includes('chicken') && !right.includes('player'));`}
        </pre>

        <h3>Boat Sailing Mechanic</h3>
        <p>
          The handleSail function transports the boat (and any items/player on it) between 
          the two river banks. It updates the positions of all entities on the boat and 
          toggles their left/right side tracking.
        </p>

        <h3>Object Interaction</h3>
        <p>
          The handleEnter function manages picking up and dropping items. The player can 
          hold one item at a time, and must find an available ground space to drop it.
        </p>
      </section>
    </div>
  );
}
