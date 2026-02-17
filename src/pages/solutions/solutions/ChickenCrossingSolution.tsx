import '../SolutionContent.css';

interface ChickenCrossingSolutionProps {
  gameId: string;
  videoUrl?: string; // e.g., "https://www.youtube.com/embed/your-video-id"
}

export default function ChickenCrossingSolution({
  gameId,
  videoUrl = "https://www.youtube.com/embed/placeholder", // Replace with your unlisted ID
}: ChickenCrossingSolutionProps) {
  const sectionId = (id: string) => `${gameId}-${id}`;

  return (
    <div className="solution-content">
      <h1>Chicken Crossing: A Model Checking Approach</h1>

      {/* 1. Video Integration */}
      <section className="video-container">
        <iframe
          width="100%"
          height="450"
          src={videoUrl}
          title="Chicken Crossing Solution Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </section>

      <hr />

      {/* 2. Introduction to Model Checking */}
      <section id={sectionId('intro')} className="solution-section" data-section-id="intro">
        <h2>What is Model Checking?</h2>
        <p>
          Model Checking is a <strong>formal verification method</strong>. We take a complex problem, 
          abstract it into a mathematical structure, and use algorithms to find every possible solution.
        </p>
        <blockquote>
          "We make our problem simpler so we can find solutions simpler."
        </blockquote>
      </section>

      {/* 3. Step 1: Building the Model */}
      <section id={sectionId('building')} className="solution-section" data-section-id="building">
        <h2>Step 1: Building the Model</h2>
        
        <h3>States: The Snapshot</h3>
        <p>
          A <strong>state</strong> is a snapshot of the system at one point in time. For this puzzle, 
          a state is defined by the position (Left or Right) of four objects:
        </p>
        <ul>
          <li>Farmer (Player)</li>
          <li>Chicken</li>
          <li>Fox</li>
          <li>Grain</li>
        </ul>
        <p>Combined, every possible combination of these positions forms our <strong>State Space</strong>.</p>
        

        <h3>Actions: Moving between States</h3>
        <p>
          Actions define how we traverse the State Space. In PRISM, we define these as rules:
        </p>
        <pre className="code-block">
{`// Example: Moving the farmer alone
[move_none] safe & !goal -> (farmer' = (farmer = LEFT ? RIGHT : LEFT));`}
        </pre>
        <p>
          <strong>The Logic:</strong> If the state is "safe" and we haven't reached the "goal," 
          then flip the farmer's position from Left to Right (or vice versa).
        </p>
      </section>

      {/* 4. Step 2: Verifying the Model */}
      <section id={sectionId('verifying')} className="solution-section" data-section-id="verifying">
        <h2>Step 2: Verifying the Model</h2>
        
        <h3>Properties & Rewards</h3>
        <p>
          To find the <em>shortest</em> path, we assign a "Reward" (or cost) of <strong>1 </strong> 
          to every move. We then ask PRISM:
        </p>
        <pre className="code-block">
{`Rmin=? [ F "goal" ]`}
        </pre>
        <p><em>"What is the minimum number of steps to reach the goal?"</em></p>

        <h3>The Result: 7 Moves</h3>
        <p>
          PRISM calculates the answer is <strong>7</strong>. It finds this by tracing the shortest 
          path through the state space from the start to the goal state.
        </p>
        
      </section>

      {/* 5. The Optimal Strategy */}
      <section id={sectionId('strategy')} className="solution-section" data-section-id="strategy">
        <h2>The Optimal Strategy</h2>
        <ol>
          <li><strong>Take Chicken:</strong> Farmer + Chicken → Right</li>
          <li><strong>Return Alone:</strong> Farmer → Left</li>
          <li><strong>Take Fox:</strong> Farmer + Fox → Right</li>
          <li><strong>Return with Chicken:</strong> Farmer + Chicken → Left (Crucial Step!)</li>
          <li><strong>Take Grain:</strong> Farmer + Grain → Right</li>
          <li><strong>Return Alone:</strong> Farmer → Left</li>
          <li><strong>Take Chicken:</strong> Farmer + Chicken → Right</li>
        </ol>
      </section>

    {/* 6. The full PRISM model */}
    <section id={sectionId('full-model')} className="solution-section" data-section-id="full-model">
      <h2>Full PRISM Model</h2>
      <pre className="code-block">
{`
mdp

const int LEFT = 0;
const int RIGHT = 1;

module river_crossing
    farmer : [LEFT..RIGHT] init LEFT; // farmer
    chicken : [LEFT..RIGHT] init LEFT; // chicken
    fox : [LEFT..RIGHT] init LEFT; // fox
    grain : [LEFT..RIGHT] init LEFT; // grain

    // move farmer alone // remember goal safeguard
    [move_none] safe & !goal -> (farmer' = (farmer = LEFT ? RIGHT : LEFT));

    // move farmer with chicken
    [move_chicken] safe & (chicken = farmer)& !goal -> (farmer' = (farmer = LEFT ? RIGHT : LEFT)) & (chicken' = (chicken = LEFT ? RIGHT : LEFT ));

    // move farmer with fox
    [move_fox] safe & (fox = farmer)& !goal -> (farmer' = (farmer = LEFT ? RIGHT : LEFT)) & (fox' = (fox = LEFT ? RIGHT : LEFT));

    // move farmer with grain
    [move_grain] safe & (grain = farmer)& !goal -> (farmer' = (farmer = LEFT ? RIGHT : LEFT)) & (grain' = (grain = LEFT ? RIGHT : LEFT));
endmodule

formula unsafe = ((chicken = fox) & (farmer != chicken)) | ((chicken = grain) & (farmer != chicken));
formula safe = !unsafe;
formula goal = (farmer = RIGHT & chicken = RIGHT & fox = RIGHT & grain = RIGHT);

label "goal" = (farmer = RIGHT & chicken = RIGHT & fox = RIGHT & grain = RIGHT);

rewards "moves"
    [move_none] true : 1;
    [move_chicken] true : 1;
    [move_fox] true : 1;
    [move_grain] true : 1;
endrewards
`}
      </pre>
      <p>
        (Note: The full model includes all actions and reward definitions.)
      </p>
    </section>
    </div>
);
}

