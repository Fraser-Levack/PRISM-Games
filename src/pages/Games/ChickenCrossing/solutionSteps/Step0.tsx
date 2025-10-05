import React from 'react';

export interface StepComponentProps {
  // Add any common props that all step components might need
  isActive?: boolean;
  onAction?: () => void;
}

const Step0: React.FC<StepComponentProps> = ({ isActive = false }) => {
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
          Step 1 of 8
        </h3>
        <span style={{
          fontSize: '14px',
          color: '#ccc'
        }}>
          Initial Setup
        </span>
      </div>

      <h4 style={{
        color: '#fff',
        margin: '0 0 10px 0',
        fontSize: '16px'
      }}>
        Starting Position - Everyone on the Left
      </h4>

      {/* Placeholder content area - you can customize this section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
          [Placeholder for detailed step content - customize as needed]
        </p>
        <p style={{ color: '#ccc', margin: '10px 0 0 0', fontSize: '14px' }}>
          Add your detailed explanation, diagrams, or interactive elements here.
        </p>
      </div>

      {/* Side-by-side layout for left/right sides */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        margin: '20px 0',
        gap: '20px'
      }}>
        <div style={{
          flex: 1,
          background: 'rgba(239, 68, 68, 0.2)',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.5)'
        }}>
          <h5 style={{
            color: '#ef4444',
            margin: '0 0 10px 0',
            fontSize: '14px'
          }}>
            LEFT SIDE
          </h5>
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>🐔 Chicken</div>
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>🦊 Fox</div>
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>🌾 Grain</div>
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>👤 Player</div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '24px'
        }}>
          🌊
        </div>

        <div style={{
          flex: 1,
          background: 'rgba(74, 222, 128, 0.2)',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid rgba(74, 222, 128, 0.5)'
        }}>
          <h5 style={{
            color: '#4ade80',
            margin: '0 0 10px 0',
            fontSize: '14px'
          }}>
            RIGHT SIDE
          </h5>
          <div style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>
            Empty
          </div>
        </div>
      </div>

      {/* Explanation section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.4'
      }}>
        <strong>Objective:</strong> Everyone starts on the left side. The goal is to get everyone across safely without violating the rules.
      </div>
    </div>
  );
};

export default Step0;