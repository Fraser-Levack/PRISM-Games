import React from 'react';
import type { StepComponentProps } from './Step0';

const Step4: React.FC<StepComponentProps> = ({ isActive = false }) => {
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
          Strategic Return
        </span>
      </div>

      <h4 style={{
        color: '#fff',
        margin: '0 0 10px 0',
        fontSize: '16px'
      }}>
        Player and Chicken Return Together
      </h4>

      {/* Placeholder content area */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
          [Placeholder for detailed step content - customize as needed]
        </p>
      </div>

      {/* Side-by-side layout */}
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
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>🌾 Grain</div>
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>🐔 Chicken</div>
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
          <div style={{ fontSize: '14px', marginBottom: '5px' }}>🦊 Fox</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.4'
      }}>
        <strong>Solution:</strong> Bring chicken back to prevent fox from eating it.
      </div>
    </div>
  );
};

export default Step4;