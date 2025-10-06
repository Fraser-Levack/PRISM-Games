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
          How to solve the problem using model checking.
        </span>
      </div>

      <h4 style={{
        color: '#fff',
        margin: '0 0 10px 0',
        fontSize: '16px'
      }}>
        Making a Model
      </h4>

      {/* Placeholder content area - you can customize this section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
          We can solve the Chicken Crossing puzzle using model checking by creating a formal model of the problem. This involves defining the states, actions, and constraints of the puzzle in a way that a model checker can understand.
          <br></br><br></br>
          Firstly we need to decide what type of model we are working with. Since this game has no luck or chance involved we will use
          a deterministic model. This means that the outcome of each action is predictable and there are no random elements.
          <br></br><br></br>
          Next we need to define the states of the model. In this case, a state can be represented by the positions of the player, chicken, fox, and grain (left or right side of the river).
          Therefore we have four variables, each of which can take on two values (left or right). This gives us a total of 2^4 = 16 possible states.
          <br></br><br></br>
          In PRISM language we write this as:
        </p>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#3b82f6',
            margin: '10px 0 0 0',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <span>
              f : [0..1] init 0; <span style={{ color: 'green', fontFamily: 'inherit' }}>// This represents the farmer (or player)</span><br />
              c : [0..1] init 0; <span style={{ color: 'green', fontFamily: 'inherit' }}>// This represents the chicken</span><br />
              x : [0..1] init 0; <span style={{ color: 'green', fontFamily: 'inherit' }}>// This represents the fox</span><br />
              g : [0..1] init 0; <span style={{ color: 'green', fontFamily: 'inherit' }}>// This represents the grain</span>
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-side layout for left/right sides */}
    </div>
  );
};

export default Step0;