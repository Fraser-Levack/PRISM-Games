import React from 'react';
import type { StepComponentProps } from './Step0';

const Step7: React.FC<StepComponentProps> = ({ isActive = false }) => {
  return (
    <div style={{
      background: 'rgba(59, 130, 246, 0.1)',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px',
      border: isActive ? '2px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.3)'
    }}>
      <p style={{ color: '#ccc', margin: '0 0 10px 0', fontSize: '14px' }}>  
    This visual replaces the binary state labels with actual snapshots from the puzzle — 
    so each node is a miniature scene showing who’s on which riverbank.  

  </p>

  <div
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '15px',
      borderRadius: '8px',
      overflowY: 'scroll',
      maxHeight: '500px',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      textAlign: 'center'
    }}
  >
    <img
      src="/Visual_State_Space_Graph.svg"
      alt="Visual State Space Graph"
      style={{
        width: '100%',
        maxWidth: '1600px',
        height: 'auto',
        borderRadius: '10px'
      }}
    />
  </div>
    </div>
  );
};

export default Step7;