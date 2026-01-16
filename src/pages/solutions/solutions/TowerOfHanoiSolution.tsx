import '../SolutionContent.css';

interface TowerOfHanoiSolutionProps {
  gameId: string;
}

export default function TowerOfHanoiSolution({
  gameId,
}: TowerOfHanoiSolutionProps) {
  const sectionId = (id: string) => `${gameId}-${id}`;

  return (
    <div className="solution-content">
      <h1>Tower of Hanoi Solution</h1>

      <section
        id={sectionId('overview')}
        data-section-id="overview"
        className="solution-section"
      >
        <h2>Overview</h2>
        <p>
          The Tower of Hanoi is a classic mathematical puzzle involving three
          rods and a number of disks of different sizes. The objective is to
          move all disks from one rod to another following specific rules.
        </p>
        <h3>The Rules</h3>
        <ul>
          <li>Only one disk can be moved at a time</li>
          <li>A larger disk can never be placed on a smaller disk</li>
          <li>All disks must be moved from the source rod to the destination rod</li>
        </ul>
        <h3>Minimum Moves Required</h3>
        <p>
          For n disks, the minimum number of moves required is 2<sup>n</sup> - 1.
        </p>
      </section>

      <section
        id={sectionId('algorithm')}
        data-section-id="algorithm"
        className="solution-section"
      >
        <h2>Recursive Solution</h2>
        <p>
          The Tower of Hanoi problem is naturally suited to a recursive solution.
          The approach breaks down the problem into smaller subproblems.
        </p>

        <h3>Algorithm Steps</h3>
        <ol>
          <li>Move n-1 disks from source to auxiliary rod (using destination as temporary)</li>
          <li>Move the largest disk from source to destination rod</li>
          <li>Move n-1 disks from auxiliary to destination rod (using source as temporary)</li>
        </ol>

        <h3>Base Case</h3>
        <p>When n = 1, simply move the disk from source to destination.</p>

        <h3>Time Complexity</h3>
        <p>
          O(2<sup>n</sup>) - exponential time complexity due to the nature of the
          problem.
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
            <strong>TowerOfHanoiGame:</strong> Main game component with UI
          </li>
          <li>
            <strong>Rod Component:</strong> Represents individual rods
          </li>
          <li>
            <strong>Disk Component:</strong> Represents individual disks
          </li>
        </ul>

        <h3>State Management</h3>
        <p>
          Maintains the current configuration of disks on each rod, number of
          moves made, and hints or solutions.
        </p>

        <h3>Move Validation</h3>
        <p>
          Each move is validated to ensure it follows the rules of the puzzle
          before being applied to the game state.
        </p>
      </section>

      <section
        id={sectionId('codeWalkthrough')}
        data-section-id="codeWalkthrough"
        className="solution-section"
      >
        <h2>Recursive Solution Implementation</h2>

        <h3>Core Recursive Function</h3>
        <pre className="code-block">
{`function solveHanoi(n, source, destination, auxiliary) {
  if (n === 1) {
    // Base case: move single disk
    moveDisks.push({
      from: source,
      to: destination,
    });
    return;
  }

  // Move n-1 disks from source to auxiliary
  solveHanoi(n - 1, source, auxiliary, destination);

  // Move the largest disk from source to destination
  moveDisks.push({
    from: source,
    to: destination,
  });

  // Move n-1 disks from auxiliary to destination
  solveHanoi(n - 1, auxiliary, destination, source);
}`}
        </pre>

        <h3>Move Validation</h3>
        <p>
          Before allowing a move, the game checks if the target rod's top disk
          is larger than the disk being moved.
        </p>

        <h3>Solution Hints</h3>
        <p>
          The game can generate optimal solution paths and provide hints to the
          player during gameplay.
        </p>
      </section>
    </div>
  );
}
