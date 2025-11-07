import '../../../styles/GamePopUp.css';

type Props = {
  onStart: () => void;
  onSkip?: () => void;
}

const Tutorial = ({ onStart, onSkip }: Props) => {
  return (
    <div className="popup-card" style={{ maxWidth: 640 }}>
      <h2 style={{ marginTop: 0, color: '#3b82f6' }}>Welcome to Chicken Crossing</h2>

      <div style={{ color: '#fff', marginBottom: 12 }}>
        Objective:
        <ul>
          <li>Transport the chicken, fox and grain across the river using the boat.</li>
          <li>You cannot leave the fox alone with the chicken, or the chicken with the grain.</li>
          <li>Use WASD or Arrow keys to move. Press Space to pick up / drop items. Press Enter to sail when near the boat.</li>
        </ul>
      </div>

      <div style={{ color: '#fff', marginBottom: 12 }}>
        Controls summary:
        <ul>
          <li>Move: W A S D or Arrow keys</li>
          <li>Pickup / Drop: Space</li>
          <li>Sail (when near boat): Enter</li>
          <li>Restart: R</li>
        </ul>
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