// !! Steps were removed from final version, but keeping this file in case we want to add them back in the future. !!

import React from 'react';
import type { StepComponentProps } from './Step0';

const Step6: React.FC<StepComponentProps> = ({ isActive = false }) => {
  return (
    <div style={{
      background: 'rgba(59, 130, 246, 0.1)',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px',
      border: isActive ? '2px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.3)'
    }}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  }}>
    <h3 style={{
      color: '#3b82f6',
      margin: '0',
      fontSize: '18px'
    }}>
      Step 5 of 8
    </h3>
    <span style={{
      fontSize: '14px',
      color: '#ccc'
    }}>
      Exploring the Optimal Strategy
    </span>
  </div>

  <h4 style={{
    color: '#fff',
    margin: '0 0 10px 0',
    fontSize: '16px'
  }}>
    The Model’s Optimal Solution
  </h4>

  <div style={{
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px'
  }}>
    <p style={{ color: '#ccc', margin: '0 0 10px 0', fontSize: '14px' }}>
      Once the state space is generated, the model checker can compute the **optimal strategy** — 
      the fewest moves needed for the farmer to bring everyone safely across.  
      Below is the visualized strategy graph, showing each move step by step.
    </p>

    {/* Scrollable embedded graph */}
    <div
      style={{
        maxHeight: '300px',
        overflowY: 'auto',
        overflowX: 'auto',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '8px',
        background: 'rgba(17,24,39,0.6)',
        padding: '10px'
      }}
    >
      <img
        src="/strategy-view.svg"
        alt="Optimal Strategy Graph"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          margin: 'auto auto'
        }}
      />
    </div>

    <p style={{ color: '#ccc', margin: '15px 0 10px 0', fontSize: '14px' }}>
      You can also view it in full resolution if you prefer:
    </p>

    <button
      onClick={() => window.open('/strategy-view.svg', '_blank')}
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
      📈 View Full Strategy Graph (New Tab)
    </button>
  </div>


    </div>
  );
};

export default Step6;