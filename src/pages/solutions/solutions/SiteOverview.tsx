import '../SolutionContent.css';

interface SiteOverviewProps {
  gameId: string;
}

export default function SiteOverview({ gameId }: SiteOverviewProps) {
  const sectionId = (id: string) => `${gameId}-${id}`;

  return (
    <div className="solution-content">
      <h1>Welcome to PRISM Games Solutions</h1>

      <section
        id={sectionId('overview')}
        data-section-id="overview"
        className="solution-section"
      >
        <h2>About This Site</h2>
        <p>
          Welcome to PRISM Games, an interactive educational platform that brings together
          classic logic puzzles and games with comprehensive explanations powered by formal
          verification techniques. This site is designed to help students, educators, and
          enthusiasts understand the mathematical foundations behind game strategies and
          optimal solutions.
        </p>
        <h3>What You'll Find Here</h3>
        <p>
          Each game on this platform includes three main components:
        </p>
        <ul>
          <li>
            <strong>Interactive Gameplay:</strong> Play the games directly in your browser
            with intuitive controls and visual feedback
          </li>
          <li>
            <strong>Detailed Solutions:</strong> Step-by-step explanations of optimal
            strategies and algorithms
          </li>
          <li>
            <strong>Formal Analysis:</strong> Mathematical models and verification results
            using the PRISM model checker
          </li>
        </ul>
      </section>

      <section
        id={sectionId('solutions-explained')}
        data-section-id="solutions-explained"
        className="solution-section"
      >
        <h2>Understanding the Solutions</h2>
        <p>
          The solutions provided for each game go beyond simple walkthroughs. They explore
          the underlying logic, algorithms, and mathematical principles that govern optimal
          play. Here's what each solution section covers:
        </p>
        <h3>Solution Structure</h3>
        <ul>
          <li>
            <strong>Overview:</strong> Introduction to the game mechanics, rules, and
            objectives
          </li>
          <li>
            <strong>Core Algorithm:</strong> Detailed explanation of the solving algorithm
            with pseudocode and implementation details
          </li>
          <li>
            <strong>PRISM Model:</strong> Formal specification using probabilistic model
            checking, including state spaces and transition systems
          </li>
          <li>
            <strong>Verification Results:</strong> Analysis of properties such as
            reachability, optimal strategies, and winning probabilities
          </li>
          <li>
            <strong>Implementation:</strong> Technical details about how the game is
            implemented in code
          </li>
          <li>
            <strong>Extensions:</strong> Possible variations and future enhancements
          </li>
        </ul>
      </section>

      <section
        id={sectionId('prism-integration')}
        data-section-id="prism-integration"
        className="solution-section"
      >
        <h2>PRISM Model Checker Integration</h2>
        <p>
          A unique feature of this platform is the integration with PRISM, a probabilistic
          model checker that allows us to formally verify game properties and strategies.
        </p>
        <h3>What is PRISM?</h3>
        <p>
          PRISM is a formal verification tool used to analyze systems that exhibit
          probabilistic behavior. In the context of games, it helps us:
        </p>
        <ul>
          <li>Prove that strategies are optimal</li>
          <li>Calculate exact probabilities of winning</li>
          <li>Determine minimum/maximum expected moves to reach a goal</li>
          <li>Verify safety properties and invariants</li>
        </ul>
        <h3>How We Use PRISM</h3>
        <p>
          For each game, we create a formal model that represents:
        </p>
        <ul>
          <li>
            <strong>States:</strong> All possible configurations of the game
          </li>
          <li>
            <strong>Actions:</strong> Valid moves or transitions between states
          </li>
          <li>
            <strong>Properties:</strong> Questions we want to answer about the game
            (e.g., "Can the player always win?")
          </li>
        </ul>
        <p>
          The PRISM model checker then analyzes these models to provide mathematically
          proven results about game behavior and optimal strategies.
        </p>
      </section>

      <section
        id={sectionId('getting-started')}
        data-section-id="getting-started"
        className="solution-section"
      >
        <h2>Getting Started</h2>
        <p>
          Ready to explore? Here's how to make the most of this platform:
        </p>
        <ol>
          <li>
            <strong>Play First:</strong> Try each game yourself before reading the
            solutions to develop your own strategies
          </li>
          <li>
            <strong>Read the Overview:</strong> Understand the game rules and objectives
          </li>
          <li>
            <strong>Study the Algorithm:</strong> Learn how optimal strategies are computed
          </li>
          <li>
            <strong>Explore the PRISM Model:</strong> See how formal verification provides
            mathematical guarantees
          </li>
          <li>
            <strong>Experiment:</strong> Use the interactive tutorials to practice and
            reinforce your understanding
          </li>
        </ol>
        <p>
          Select a game from the sidebar to begin your journey into the fascinating world
          of game theory, algorithms, and formal verification!
        </p>
      </section>
    </div>
  );
}
