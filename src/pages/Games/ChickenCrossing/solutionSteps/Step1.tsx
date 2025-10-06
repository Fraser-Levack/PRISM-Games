import React from 'react';
import type { StepComponentProps } from './Step0';

const Step1: React.FC<StepComponentProps> = ({ isActive = false }) => {
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
          Step 2 of 8
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
        Running the Model
      </h4>

      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
          To use the model we need to define the goal and the failure states (constraints).
          These failure states are written as formulas that will, when true, result in a deadlock.
          The example for this game is as follows:
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
              formula unsafe = ((c = x) & (f != c)) | ((c = g) & (f != c)); <br></br>
              formula safe = !unsafe; <br></br>
            </span>
          </div>
          </div>
          <p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
          Next for the goal we can simply define a state where all characters are on the right side of the river, 
          giving this state the "goal" label when true:
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
              label "goal" = (f = 1 & c = 1 & x = 1 & g = 1); <br></br>
            </span>
          </div>
        </div>
        <p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
          Lastly we write the possible actions that can be taken in the model.
          Since its just the river crossing we can flip the state of the chosen object and the player. 
          To do this we use commands and we can write these like this:
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
              [move_none] safe -{'>'} (f' = 1 - f); <br></br>
              [move_chicken] safe & (c = f) -{'>'} (f' = 1 - f) & (c' = 1 - c); <br></br>
              [move_fox] safe & (x = f) -{'>'} (f' = 1 - f) & (x' = 1 - x); <br></br>
              [move_grain] safe & (g = f) -{'>'} (f' = 1 - f) & (g' = 1 - g); <br></br>
            </span>
          </div>
        </div>
      
      </div>
      
      
    </div>
  );
};

export default Step1;