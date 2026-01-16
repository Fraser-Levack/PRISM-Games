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
      { id: 'overview', name: 'Overview' },
      { id: 'algorithm', name: 'Algorithm' },
      { id: 'implementation', name: 'Implementation' },
      { id: 'codeWalkthrough', name: 'Code Walkthrough' },
    ],
  },
  {
    id: 'towerOfHanoi',
    name: 'Tower of Hanoi',
    sections: [
      { id: 'overview', name: 'Overview' },
      { id: 'algorithm', name: 'Algorithm' },
      { id: 'implementation', name: 'Implementation' },
      { id: 'codeWalkthrough', name: 'Code Walkthrough' },
    ],
  },
  {
    id: 'shutTheBox',
    name: 'Shut The Box',
    sections: [
      { id: 'overview', name: 'Overview' },
      { id: 'algorithm', name: 'Algorithm' },
      { id: 'implementation', name: 'Implementation' },
      { id: 'codeWalkthrough', name: 'Code Walkthrough' },
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