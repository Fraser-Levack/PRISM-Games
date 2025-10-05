import React, { useState } from 'react';
import { 
  Step0, Step1, Step2, Step3, Step4, Step5, Step6, Step7 
} from './solutionSteps';

interface GameStatusPopupProps {
  gameStatus: 'won' | 'lost' | 'paused';
  onClose: () => void;
  onRestart: () => void;
}

// Array of step components for easy navigation
const STEP_COMPONENTS = [Step0, Step1, Step2, Step3, Step4, Step5, Step6, Step7];

const GameStatusPopup: React.FC<GameStatusPopupProps> = ({ 
  gameStatus, 
  onClose, 
  onRestart 
}) => {
  const [showSolution, setShowSolution] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const getStatusDisplay = () => {
    switch (gameStatus) {
      case 'won':
        return { 
          message: '🎉 Congratulations! You Won!', 
          color: '#4ade80',
          showSolutionButton: true
        };
      case 'lost':
        return { 
          message: '💀 Game Over! You Lost!', 
          color: '#ef4444',
          showSolutionButton: true
        };
      case 'paused':
        return { 
          message: '⏸️ Game Paused', 
          color: '#f59e0b',
          showSolutionButton: false
        };
      default:
        return { 
          message: '', 
          color: '#ffffff',
          showSolutionButton: false
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  const nextStep = () => {
    if (currentStep < STEP_COMPONENTS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetSolution = () => {
    setCurrentStep(0);
  };

  if (!showSolution) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 200,
        background: 'rgba(0, 0, 0, 0.95)',
        color: statusDisplay.color,
        padding: '30px 40px',
        borderRadius: '15px',
        textAlign: 'center',
        border: `3px solid ${statusDisplay.color}`,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
        animation: 'fadeInScale 0.3s ease-out',
        minWidth: '300px'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          {statusDisplay.message}
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          alignItems: 'center'
        }}>
          <button
            onClick={onRestart}
            style={{
              background: '#4ade80',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#22c55e'}
            onMouseOut={(e) => e.currentTarget.style.background = '#4ade80'}
          >
            🔄 Restart Game
          </button>
          
          {statusDisplay.showSolutionButton && (
            <button
              onClick={() => setShowSolution(true)}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              💡 Show PRISM's Solution
            </button>
          )}
          
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: '2px solid #666',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#999'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#666'}
          >
            ✕ Close
          </button>
        </div>
      </div>
    );
  }

  // Get the current step component
  const CurrentStepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 200,
      background: 'rgba(0, 0, 0, 0.95)',
      color: '#ffffff',
      padding: '30px',
      borderRadius: '15px',
      border: '3px solid #3b82f6',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)',
      animation: 'fadeInScale 0.3s ease-out',
      maxWidth: '600px',
      minWidth: '500px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          color: '#3b82f6',
          margin: '0',
          fontSize: '24px'
        }}>
          💡 Solution Guide
        </h2>
        <button
          onClick={() => setShowSolution(false)}
          style={{
            background: 'transparent',
            color: '#666',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Render the current step component */}
      <CurrentStepComponent isActive={true} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '15px'
      }}>
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          style={{
            background: currentStep === 0 ? '#444' : '#6b7280',
            color: currentStep === 0 ? '#666' : '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          ← Previous
        </button>

        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={resetSolution}
            style={{
              background: '#f59e0b',
              color: '#000',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#d97706'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f59e0b'}
          >
            🔄 Reset
          </button>

          <button
            onClick={onRestart}
            style={{
              background: '#4ade80',
              color: '#000',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#22c55e'}
            onMouseOut={(e) => e.currentTarget.style.background = '#4ade80'}
          >
            🎮 Try Again
          </button>
        </div>

        <button
          onClick={nextStep}
          disabled={currentStep === STEP_COMPONENTS.length - 1}
          style={{
            background: currentStep === STEP_COMPONENTS.length - 1 ? '#444' : '#6b7280',
            color: currentStep === STEP_COMPONENTS.length - 1 ? '#666' : '#fff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: currentStep === STEP_COMPONENTS.length - 1 ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default GameStatusPopup;