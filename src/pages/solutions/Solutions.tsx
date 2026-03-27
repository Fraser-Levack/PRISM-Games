import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SolutionsSideBar from './SolutionsSideBar';
import SiteOverview from './solutions/SiteOverview';
import ChickenCrossingSolution from './solutions/ChickenCrossingSolution';
import TowerOfHanoiSolution from './solutions/TowerOfHanoiSolution';
import ShutTheBoxSolution from './solutions/ShutTheBoxSolution';
import './Solutions.css';

export default function Solutions() {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate
  const contentRef = useRef<HTMLElement | null>(null);

  const [activeGame, setActiveGame] = useState('siteOverview');
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gameParam = params.get('game') || 'siteOverview';
    const sectionParam = params.get('section') || 'overview';

    setActiveGame(gameParam);
    setActiveSection(sectionParam);

    // If the game changed, scroll to the top of the container
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.search]);

  const handleGameChange = (gameId: string) => {
    // When switching games, we reset to the 'overview' section
    navigate(`/solutions?game=${gameId}&section=overview`);
  };

  const handleSectionSelect = (sectionId: string) => {
    // Update the URL with the new section
    navigate(`/solutions?game=${activeGame}&section=${sectionId}`);
    
    // Perform the actual scroll
    const target = document.getElementById(`${activeGame}-${sectionId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // (Intersection Observer)
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>('[data-section-id]')
    );

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);

        if (visible.length > 0) {
          const topSection = visible[0].target as HTMLElement;
          const sectionId = topSection.dataset.sectionId;
          
          // Only update state if it's different to avoid infinite nav loops
          if (sectionId && sectionId !== activeSection) {
            setActiveSection(sectionId);
          }
        }
      },
      { root: container, threshold: 0.4 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [activeGame, activeSection]);

  const renderSolution = () => {
    switch (activeGame) {
      case 'siteOverview': return <SiteOverview gameId="siteOverview" />;
      case 'chickenCrossing': return <ChickenCrossingSolution gameId="chickenCrossing" />;
      case 'towerOfHanoi': return <TowerOfHanoiSolution gameId="towerOfHanoi" />;
      case 'shutTheBox': return <ShutTheBoxSolution gameId="shutTheBox" />;
      default: return <SiteOverview gameId="siteOverview" />;
    }
  };

  return (
    <div className="solutions-container">
      <SolutionsSideBar
        activeGame={activeGame}
        activeSection={activeSection}
        onGameSelect={handleGameChange}
        onSectionSelect={handleSectionSelect}
      />
      <main className="solutions-content" ref={contentRef}>
        {renderSolution()}
      </main>
    </div>
  );
}