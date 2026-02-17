import { useEffect, useRef, useState } from 'react';
// import { useLocation } from 'react-router-dom';
import SolutionsSideBar from './SolutionsSideBar';
import SiteOverview from './solutions/SiteOverview';
import ChickenCrossingSolution from './solutions/ChickenCrossingSolution';
import TowerOfHanoiSolution from './solutions/TowerOfHanoiSolution';
import ShutTheBoxSolution from './solutions/ShutTheBoxSolution';
import './Solutions.css';

export default function Solutions() {
  // const location = useLocation();
  const [activeGame, setActiveGame] = useState('siteOverview');
  const [activeSection, setActiveSection] = useState('overview');
  const contentRef = useRef<HTMLElement | null>(null);

  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(`${activeGame}-${sectionId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    setActiveSection('overview');
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeGame]);

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
          .sort(
            (a, b) =>
              a.target.getBoundingClientRect().top -
              b.target.getBoundingClientRect().top
          );

        if (visible.length > 0) {
          const topSection = visible[0].target as HTMLElement;
          const sectionId = topSection.dataset.sectionId;
          if (sectionId) {
            setActiveSection(sectionId);
          }
        }
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, [activeGame]);

  const renderSolution = () => {
    switch (activeGame) {
      case 'siteOverview':
        return <SiteOverview gameId="siteOverview" />;
      case 'chickenCrossing':
        return <ChickenCrossingSolution gameId="chickenCrossing" />;
      case 'towerOfHanoi':
        return <TowerOfHanoiSolution gameId="towerOfHanoi" />;
      case 'shutTheBox':
        return <ShutTheBoxSolution gameId="shutTheBox" />;
      default:
        return <SiteOverview gameId="siteOverview" />;
    }
  };

  return (
    <div className="solutions-container">
      <SolutionsSideBar
        activeGame={activeGame}
        activeSection={activeSection}
        onGameSelect={(game) => {
          setActiveGame(game);
          setActiveSection('overview');
        }}
        onSectionSelect={handleSectionSelect}
      />
      <main className="solutions-content" ref={contentRef}>
        {renderSolution()}
      </main>
    </div>
  );
}