// !! Steps were removed from final version, but keeping this file in case we want to add them back in the future. !!

import React from 'react';
import type { StepComponentProps } from './Step0';

const Step4: React.FC<StepComponentProps> = ({ isActive = false }) => {
  const openGraphInNewTab = () => {
    window.open('/Crossing-Graph-SVG.svg', '_blank');
  };
  return (
    <div style={{
      background: 'rgba(59, 130, 246, 0.1)',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px',
      border: isActive ? '2px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.3)'
    }}>
      <p style={{ color: '#ccc', margin: '0 0 10px 0', fontSize: '16px' }}>
  Once our model is defined, PRISM can explore every possible combination of actions and outcomes —
  creating what’s called a <strong>state space</strong>.  
  <br /><br />
  Each state represents a snapshot of the puzzle: where the <img src="/Icons/Farmer_Icon.png" width="18" alt="Farmer" /> Farmer, 
  <img src="/Icons/Chicken_Icon.png" width="18" alt="Chicken" /> Chicken, 
  <img src="/Icons/Fox_Icon.png" width="18" alt="Fox" /> Fox, and 
  <img src="/Icons/Grain_Icon.png" width="18" alt="Grain" /> Grain are positioned.  
  The arrows between states show how one valid move leads to the next.
  
  </p>

<button
  onClick={openGraphInNewTab}
  style={{
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
  }}
>
  🌐 View PRISM State Space Graph (New Tab)
</button>

    </div>
  );
};

export default Step4;