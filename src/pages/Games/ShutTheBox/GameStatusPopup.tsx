import { useNavigate } from 'react-router-dom';
import '../../../styles/GamePopUp.css'

type Props = {
  gameStatus: 'won' | 'lost' | 'paused';
  lossReason?: string | null;
  dice?: number[];
  onClose: () => void;
  onRestart: () => void;
}

const GameStatusPopup = ({ 
  gameStatus, 
  lossReason,
  dice, 
  onClose, 
  onRestart 
}: Props) => {
  const navigate = useNavigate();

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
    const diceDisplay = dice ? `You rolled ${dice[0]} + ${dice[1]} = ${dice[0] + dice[1]}` : '';
    
    if (!lossReason) {
      return diceDisplay ? `${diceDisplay}. No valid moves possible with the remaining pins.` : 'No valid moves possible with the remaining pins.';
    }
    
    switch (lossReason) {
      case 'no_moves':
        return diceDisplay ? `${diceDisplay}. No combination of open pins can match your roll!` : 'No combination of open pins can match your roll!';
      case 'invalid_move':
        return 'Invalid selection: the sum doesn\'t match the dice total.';
      default:
        return lossReason;
    }
  };

  const statusDisplay = getStatusDisplay();

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
            onClick={() => navigate('/solutions')}
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
};

export default GameStatusPopup;
