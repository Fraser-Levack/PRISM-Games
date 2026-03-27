import { useState } from 'react';
import '../../../styles/GamePopUp.css';

type GameMode = 'SOLO' | 'VS_AI';

type Props = {
  onStart: (mode: GameMode) => void;
};

const Tutorial = ({ onStart }: Props) => {
  const [step, setStep] = useState<'INSTRUCTIONS' | 'MODE_SELECT'>('INSTRUCTIONS');

  if (step === 'MODE_SELECT') {
    return (
      <div className="tutorial-popup-card-stb" style={{ maxWidth: 500, textAlign: 'center' }}>
        <h2 style={{ color: '#3b82f6' }}>Select Difficulty</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20 }}>
          
          <button
            onClick={() => onStart('SOLO')}
            style={{
              background: '#4ade80', color: '#000', border: 'none', padding: '15px',
              borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer'
            }}
          >
            👤 Solo Play
            <div style={{fontSize: '0.8em', fontWeight: 'normal', opacity: 0.8}}>Try to shut the box yourself</div>
          </button>

          <button
            onClick={() => onStart('VS_AI')}
            style={{
              background: '#f472b6', color: '#000', border: 'none', padding: '15px',
              borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1em', cursor: 'pointer'
            }}
          >
            🤖 Vs AI (PRISM Strategy)
            <div style={{fontSize: '0.8em', fontWeight: 'normal', opacity: 0.8}}>Challenge the optimal strategy</div>
          </button>

        </div>
      </div>
    );
  }

  // Instructions (Existing Code)
  return (
    <div className="tutorial-popup-card-stb" style={{ maxWidth: 640 }}>
      <h2 style={{ marginTop: 0, color: '#3b82f6' }}>Welcome to Shut the Box</h2>

      <div style={{ marginBottom: 2 }}>
        Objective:
        <ul>
          <li>Roll the dice and shut all pins numbered 1-9.</li>
          <li>Select pins that add up to the dice total, then confirm your move.</li>
          <li>The game ends when you shut all pins (you win!) or can't make a valid move (you lose).</li>
        </ul>
      </div>

      <div style={{ marginBottom: 12 }}>
        How to Play:
        <ul>
          <li><strong>Roll Phase:</strong> Click the dice to roll. The sum is displayed in the HUD.</li>
          <li><strong>Select Phase:</strong> Click pins to select them (they'll turn green). Selected pins must add up to the dice total.</li>
          <li><strong>Confirm:</strong> Once the sum matches, click "Confirm Move" to shut the selected pins.</li>
          <li><strong>Win:</strong> Shut all 9 pins to win!</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
          💡 Example: If you roll a 7, you could select pin 7, or pins 3+4, or pins 1+2+4, etc.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
        <button
          onClick={() => setStep('MODE_SELECT')}
          style={{
            background: '#3b82f6', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          Next: Select Mode
        </button>
      </div>
    </div>
  );
};

export default Tutorial;
