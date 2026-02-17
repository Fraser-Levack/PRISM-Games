interface SolutionsSideBarProps {
  activeGame: string;
  activeSection: string;
  onGameSelect: (game: string) => void;
  onSectionSelect: (section: string) => void;
}

const games = [
  {
    id: 'siteOverview',
    name: 'PRISM Games Overview',
    sections: [
      { id: 'overview', name: 'About This Site' },
      { id: 'solutions-explained', name: 'Understanding Solutions' },
      { id: 'prism-integration', name: 'PRISM Integration' },
      { id: 'getting-started', name: 'Getting Started' },
    ],
  },
  {
    id: 'chickenCrossing',
    name: 'Chicken Crossing',
    sections: [
      { id: 'intro', name: 'What is Model Checking?' },
      { id: 'building', name: 'Step 1: States & Actions' },
      { id: 'verifying', name: 'Step 2: Verification' },
      { id: 'strategy', name: 'Optimal Strategy' },
      { id: 'full-model', name: 'Full PRISM Model' },
    ],
  },
  {
    id: 'towerOfHanoi',
    name: 'Tower of Hanoi',
    sections: [
      { id: 'formulas', name: 'Formulas & Labels' },
      { id: 'renaming', name: 'Module Renaming' },
      { id: 'logic', name: 'Movement Logic' },
      { id: 'verification', name: 'Verification Results' },
      { id: 'full-model', name: 'Full PRISM Model' },
    ],
  },
  {
    id: 'shutTheBox',
    name: 'Shut The Box',
    sections: [
      { id: 'probabilities', name: 'Probabilistic Models' },
      { id: 'phases', name: 'Phases & Formulas' },
      { id: 'verifying', name: 'Maximizing Rewards' },
      { id: 'ai', name: 'Playing Against AI' },
      { id: 'full-model', name: 'Full PRISM Model' },
    ],
  },
];

export default function SolutionsSideBar({
  activeGame,
  activeSection,
  onGameSelect,
  onSectionSelect,
}: SolutionsSideBarProps) {
  // const currentGame = games.find((g) => g.id === activeGame);

  return (
    <aside className="solutions-sidebar">
      <div className="sidebar-header">
        <h2>Solutions</h2>
      </div>
      <nav className="sidebar-nav">
        {games.map((game) => (
          <div key={game.id} className="game-group">
            <button
              className={`game-button ${activeGame === game.id ? 'active' : ''}`}
              onClick={() => onGameSelect(game.id)}
            >
              {game.name}
            </button>
            {activeGame === game.id && (
              <ul className="sections-list">
                {game.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      className={`section-button ${activeSection === section.id ? 'active' : ''}`}
                      onClick={() => onSectionSelect(section.id)}
                    >
                      {section.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}