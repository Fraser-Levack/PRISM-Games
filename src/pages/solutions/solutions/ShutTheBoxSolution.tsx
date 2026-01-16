import '../SolutionContent.css';

interface ShutTheBoxSolutionProps {
  gameId: string;
}

export default function ShutTheBoxSolution({
  gameId,
}: ShutTheBoxSolutionProps) {
  const sectionId = (id: string) => `${gameId}-${id}`;

  return (
    <div className="solution-content">
      <h1>Shut The Box Solution</h1>

      <section
        id={sectionId('overview')}
        data-section-id="overview"
        className="solution-section"
      >
        <h2>Overview</h2>
        <p>
          Shut The Box (also known as Bluff or Klackerlarsch) is a dice game
          played with numbered tiles from 1 to 9. The objective is to close
          (shut) all the numbered tiles by rolling dice and selecting tiles that
          sum to the dice values.
        </p>
        <h3>Game Rules</h3>
        <ul>
          <li>Start with all tiles (1-9) open</li>
          <li>Roll two dice and cover tiles that sum to the dice values</li>
          <li>Continue rolling and closing tiles until no valid moves remain</li>
          <li>Score is the sum of remaining open tiles</li>
        </ul>
        <h3>Objective</h3>
        <p>
          The goal is to achieve the lowest score by closing as many tiles as
          possible.
        </p>
      </section>

      <section
        id={sectionId('algorithm')}
        data-section-id="algorithm"
        className="solution-section"
      >
        <h2>Game Logic</h2>

        <h3>Move Generation</h3>
        <p>
          After rolling the dice, the game must find all valid combinations of
          tiles that sum to the dice values. This involves:
        </p>
        <ol>
          <li>Finding all open (unplayed) tiles</li>
          <li>Generating combinations that sum to the dice total</li>
          <li>Presenting valid moves to the player</li>
        </ol>

        <h3>Move Validation</h3>
        <p>
          A move is valid if the selected tiles sum to the dice total and all
          tiles are currently open.
        </p>

        <h3>Game End Detection</h3>
        <p>
          The game ends when the player cannot make any valid move with the
          current dice roll.
        </p>

        <h3>Score Calculation</h3>
        <p>
          Score equals the sum of all remaining open tiles at the end of the
          game.
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
            <strong>ShutTheBoxGame:</strong> Main game component
          </li>
          <li>
            <strong>Tiles:</strong> Visual representation of numbered tiles
          </li>
          <li>
            <strong>DiceRoller:</strong> Handles dice rolling mechanics
          </li>
          <li>
            <strong>MoveSelector:</strong> Allows player to select tiles
          </li>
        </ul>

        <h3>State Management</h3>
        <p>
          Tracks which tiles are open/closed, current dice values, selected
          tiles, total score, and game status.
        </p>

        <h3>Combination Generator</h3>
        <p>
          Algorithm to generate all valid tile combinations that sum to the dice
          total, considering which tiles are already closed.
        </p>
      </section>

      <section
        id={sectionId('codeWalkthrough')}
        data-section-id="codeWalkthrough"
        className="solution-section"
      >
        <h2>Key Implementation Details</h2>

        <h3>Generating Valid Moves</h3>
        <pre className="code-block">
{`function generateValidMoves(openTiles, diceSum) {
  const validMoves = [];

  function findCombinations(
    remaining,
    currentSum,
    currentSelection,
    startIdx
  ) {
    if (currentSum === diceSum) {
      validMoves.push([...currentSelection]);
      return;
    }

    if (currentSum > diceSum || startIdx >= remaining.length) {
      return;
    }

    for (let i = startIdx; i < remaining.length; i++) {
      currentSelection.push(remaining[i]);
      findCombinations(
        remaining,
        currentSum + remaining[i],
        currentSelection,
        i + 1
      );
      currentSelection.pop();
    }
  }

  findCombinations(openTiles, 0, [], 0);
  return validMoves;
}`}
        </pre>

        <h3>Closing Tiles</h3>
        <p>
          When a player selects tiles that sum to the dice total, those tiles are
          marked as closed and cannot be selected again.
        </p>

        <h3>Game Over Condition</h3>
        <p>
          The game checks if any valid moves exist after each turn. If no valid
          moves are possible, the game ends and calculates the final score.
        </p>
      </section>
    </div>
  );
}
