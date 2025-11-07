import { useState } from 'react';
import { 
  Step0, Step1, Step2, Step3, Step4, Step5, Step6, Step7 
} from './solutionSteps';
import '../../../styles/GamePopUp.css'

type Props = {
  gameStatus: 'won' | 'lost' | 'paused';
  lossReason?: string | null;
  onClose: () => void;
  onRestart: () => void;
}

// Array of step components for easy navigation
const STEP_COMPONENTS = [Step0, Step1, Step2, Step3, Step4, Step5, Step6, Step7];

const GameStatusPopup = ({ 
  gameStatus, 
  lossReason, 
  onClose, 
  onRestart 
}: Props) => {
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

  const getLossMessage = () => {
    if (!lossReason) return 'You lost.';
    switch (lossReason) {
      case 'fox':
        return 'A fox ate your chicken!';
      case 'grain':
        return 'Your chicken ate the grain!';
      // add more mappings as needed
      default:
        return lossReason;
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
      <div className='popup-card'>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          {statusDisplay.message}
        </div>

        {/* Show loss reason when gameStatus is 'lost' */}
        {gameStatus === 'lost' && (
          <div style={{
            fontSize: '16px',
            color: '#fff',
            opacity: 0.9,
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            {getLossMessage()}
          </div>
        )}
        
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
    <div className='popup-card'>
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
          💡 PRISM Solution Guide
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
            🔄 Start of Solution
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