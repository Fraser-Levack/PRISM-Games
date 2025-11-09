import '../../../styles/GamePopUp.css';
import { ControlBoard } from '../../../components/ControlBoard';

type Props = {
  onStart: () => void;
  onSkip?: () => void;
}

const Tutorial = ({ onStart}: Props) => {
  return (
    <div className="tutorial-popup-card" style={{ maxWidth: 640 }}>
      <h2 style={{ marginTop: 0, color: '#3b82f6' }}>Welcome to Chicken Crossing</h2>

      <div style={{ marginBottom: 2 }}>
        Objective:
        <ul>
          <li>Transport the chicken, fox and grain across the river using the boat.</li>
          <li>You cannot leave the fox alone with the chicken, or the chicken with the grain.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center',marginBottom: 12 }}>
        <ControlBoard />
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