import '../../../styles/GamePopUp.css';

type Props = {
  onStart: () => void;
  onSkip?: () => void;
}

const Tutorial = ({ onStart}: Props) => {
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

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
        <button
          onClick={onStart}
          style={{
            background: '#4ade80',
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#22c55e')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#4ade80')}
        >
          ▶ Start Game
        </button>
      </div>
    </div>
  );
};

export default Tutorial;
