import '../SolutionContent.css';

interface TowerOfHanoiSolutionProps {
  gameId: string;
  videoUrl?: string; // e.g., "https://www.youtube.com/embed/your-video-id"
}

export default function TowerOfHanoiSolution({
  gameId,
  videoUrl = "https://www.youtube.com/embed/TOH_VIDEO_ID", // Replace with your actual ID
}: TowerOfHanoiSolutionProps) {
  const sectionId = (id: string) => `${gameId}-${id}`;

  return (
    <div className="solution-content">
      <h1>Tower of Hanoi: Scaling with PRISM</h1>

      {/* 1. Video Integration */}
      <section className="video-container">
        <iframe
          width="100%"
          height="450"
          src={videoUrl}
          title="Tower of Hanoi - PRISM Solution"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </section>

      <hr />

      {/* 2. Formulas and Labels */}
      <section id={sectionId('formulas')} className="solution-section" data-section-id="formulas">
        <h2>Formulas and Labels: Cleaning the Code</h2>
        <p>
          In complex models like the Tower of Hanoi, writing out goal conditions manually is repetitive and prone to error. 
          PRISM allows us to use <strong>Formulas</strong>—essentially coding shortcuts.
        </p>
        
        <pre className="code-block">
{`formula goal = (pos31 = 1 & pos32 = 2 & pos33 = 3);
label "goal" = (pos31 = 1 & pos32 = 2 & pos33 = 3);`}
        </pre>
        <p>
          Now, instead of re-typing the disk positions for every guard, we can simply reference <code>!goal</code>. 
          It makes the model much cleaner and easier to read.
        </p>
      </section>

      {/* 3. Module Renaming */}
      <section id={sectionId('renaming')} className="solution-section" data-section-id="renaming">
        <h2>Module Renaming: Working Smarter</h2>
        <p>
          Since the three pegs in the Tower of Hanoi behave identically, we don't need to write logic for all three. 
          We write a <strong>base module</strong> for one peg and use <strong>Module Renaming</strong> to generate the others.
        </p>
        
        <pre className="code-block">
{`module peg2 = peg1 [
    position11 = position21,
    move_d1_p1_p2 = move_d1_p2_p3,
    ...
] endmodule`}
        </pre>
        <p>
          This acts like a <strong>template</strong>. We tell PRISM to take Peg 1’s logic and swap the position 
          and action names for Peg 2. This saves hundreds of lines of code!
        </p>
      </section>

      {/* 4. The Logic of Movement */}
      <section id={sectionId('logic')} className="solution-section" data-section-id="logic">
        <h2>State Space & Constraints</h2>
        <p>
          To solve the puzzle, we must follow two strict rules:
        </p>
        <ul>
          <li><strong>Top Only:</strong> Only the top-most disk on a peg can move.</li>
          <li><strong>Size Rule:</strong> You cannot place a larger disk on a smaller one.</li>
        </ul>
        <p>
          In PRISM, we represent these as <strong>guards</strong>. For example, to move Disk 1, 
          we check if the target slot is empty (represented by 0):
        </p>
        <pre className="code-block">
{`[move_d1_p1_p2] !goal & position23 = 0 -> (position23' = 1);`}
        </pre>
      </section>

      {/* 5. Verification Results */}
      <section id={sectionId('verification')} className="solution-section" data-section-id="verification">
        <h2>Verifying the Solution</h2>
        <p>
          By assigning a reward of <strong>1</strong> to every move, we can find the most optimal path.
        </p>
        
        <blockquote>
          <strong>The Result: 7 Moves</strong>
        </blockquote>
        <p>
          Interestingly, for a 3-disk game, the shortest path is 7 moves—exactly the same 
          as the Chicken Crossing Problem! PRISM calculates this by tracing the shortest route 
          through the mathematical state space while ensuring no rules are ever broken.
        </p>
      </section>

      {/* 6. The full PRISM model */}
    <section id={sectionId('full-model')} className="solution-section" data-section-id="full-model">
      <h2>Full PRISM Model</h2>
      <pre className="code-block">
{`
mdp

const int peg11 = 1;
const int peg12 = 2;
const int peg13 = 3;

const int peg21 = 0;
const int peg22 = 0;
const int peg23 = 0;

const int peg31 = 0;
const int peg32 = 0;
const int peg33 = 0;

module peg1
	
	
	position11 : [0..3] init peg11;
	position12 : [0..3] init peg12;
	position13 : [0..3] init peg13;
	
	[move_d1_p2_p1] !goal & position13 = 0 -> (position13' = 1);
	[move_d1_p2_p1] !goal & position13 > 1 & position12 = 0 -> (position12' = 1);
	[move_d1_p2_p1] !goal & position13 > 1 & position12 > 1 & position11 = 0 -> (position11' = 1);

	[move_d1_p3_p1] !goal & position13 = 0 -> (position13' = 1);
	[move_d1_p3_p1] !goal & position13 > 1 & position12 = 0 -> (position12' = 1);
	[move_d1_p3_p1] !goal & position13 > 1 & position12 > 1 & position11 = 0 -> (position11' = 1);
	
	[move_d1_p1_p2] !goal & position11 = 1 -> (position11' = 0);
	[move_d1_p1_p2] !goal & position12 = 1 & position11 = 0 -> (position12' = 0);
	[move_d1_p1_p2] !goal & position13 = 1 & position12 = 0 -> (position13' = 0);

	[move_d1_p1_p3] !goal & position11= 1 -> (position11' = 0);
	[move_d1_p1_p3] !goal & position12 = 1 & position11 = 0 -> (position12' = 0);
	[move_d1_p1_p3] !goal & position13 = 1 & position12 = 0 -> (position13' = 0);

	//-------------------------------------------------------------------

	[move_d2_p2_p1] !goal & position13 = 0 -> (position13' = 2);
	[move_d2_p2_p1] !goal & position13 > 2 & position12 = 0 -> (position12' = 2);
	[move_d2_p2_p1] !goal & position13 > 2 & position12 > 2 & position11 = 0 -> (position11' = 2);

	[move_d2_p3_p1] !goal & position13 = 0 -> (position13' = 2);
	[move_d2_p3_p1] !goal & position13 > 2 & position12 = 0 -> (position12' = 2);
	[move_d2_p3_p1] !goal & position13 > 2 & position12 > 2 & position11 = 0 -> (position11' = 2);
	
	[move_d2_p1_p2] !goal & position11= 2 -> (position11' = 0);
	[move_d2_p1_p2] !goal & position12 = 2 & position11 = 0 -> (position12' = 0);
	[move_d2_p1_p2] !goal & position13 = 2 & position12 = 0 -> (position13' = 0);

	[move_d2_p1_p3] !goal & position11= 2 -> (position11' = 0);
	[move_d2_p1_p3] !goal & position12 = 2 & position11 = 0 -> (position12' = 0);
	[move_d2_p1_p3] !goal & position13 = 2 & position12 = 0 -> (position13' = 0);

	//-------------------------------------------------------------------

	[move_d3_p2_p1] !goal & position11 = 0 & position12 = 0 & position13 = 0 -> (position13' = 3);

	[move_d3_p3_p1] !goal & position11 = 0 & position12 = 0 & position13 = 0 -> (position13' = 3);
	
	[move_d3_p1_p2] !goal & position11 = 0 & position12 = 0 & position13 = 3 -> (position13' = 0);

	[move_d3_p1_p3] !goal & position11 = 0 & position12 = 0 & position13 = 3 -> (position13' = 0);

endmodule


module peg2 = peg1 [

	peg11 = peg21,
	peg12 = peg22,
	peg13 = peg23,
	
	position11 = position21,
	position12 = position22,
	position13 = position23,

	move_d1_p2_p1 = move_d1_p3_p2,
	move_d1_p3_p1 = move_d1_p1_p2,
	move_d1_p1_p2 = move_d1_p2_p3,
	move_d1_p1_p3 = move_d1_p2_p1,

	move_d2_p2_p1 = move_d2_p3_p2,
	move_d2_p3_p1 = move_d2_p1_p2,
	move_d2_p1_p2 = move_d2_p2_p3,
	move_d2_p1_p3 = move_d2_p2_p1,

	move_d3_p2_p1 = move_d3_p3_p2,
	move_d3_p3_p1 = move_d3_p1_p2,
	move_d3_p1_p2 = move_d3_p2_p3,
	move_d3_p1_p3 = move_d3_p2_p1
	]

endmodule

module peg3 = peg1 [

	peg11 = peg31,
	peg12 = peg32,
	peg13 = peg33,
	
	position11 = position31,
	position12 = position32,
	position13 = position33,
    	
	move_d1_p2_p1 = move_d1_p1_p3,
	move_d1_p3_p1 = move_d1_p2_p3,
	move_d1_p1_p2 = move_d1_p3_p1,
	move_d1_p1_p3 = move_d1_p3_p2,

	move_d2_p2_p1 = move_d2_p1_p3,
	move_d2_p3_p1 = move_d2_p2_p3,
	move_d2_p1_p2 = move_d2_p3_p1,
	move_d2_p1_p3 = move_d2_p3_p2,

	move_d3_p2_p1 = move_d3_p1_p3,
	move_d3_p3_p1 = move_d3_p2_p3,
	move_d3_p1_p3 = move_d3_p3_p1,
	move_d3_p1_p2 = move_d3_p3_p2
	]

endmodule

formula goal = (position31 = 1 & position32 = 2 & position33 = 3);
label "goal" = (position31 = 1 & position32 = 2 & position33 = 3);

rewards "moves"
    true : 1;
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