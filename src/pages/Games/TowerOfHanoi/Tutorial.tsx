import '../../../styles/GamePopUp.css';

type Props = {
  onStart: () => void;
  onSkip?: () => void;
}

const Tutorial = ({ onStart}: Props) => {
  return (
    <div className="tutorial-popup-card" style={{ maxWidth: 640 }}>
      <h2 style={{ marginTop: 0, color: '#3b82f6' }}>Welcome to Tower of Hanoi</h2>

      <div style={{ marginBottom: 2 }}>
        Objective:
        <ul>
          <li>Move all disks from the left bronze peg to the gold right peg.</li>
          <li>You can only move one disk at a time.</li>
          <li>A larger disk can never be placed on top of a smaller disk.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: '14px', color: '#9ca3af' }}>
          💡 Drag and drop disks between pegs to move them.
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
