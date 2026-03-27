// !! Steps were removed from final version, but keeping this file in case we want to add them back in the future. !!

import React from 'react';
import type { StepComponentProps } from './Step0';

const Step2: React.FC<StepComponentProps> = ({ isActive = false }) => {
  // const openGraphInNewTab = () => {
  //   window.open('/Crossing-Graph-SVG.svg', '_blank');
  // };

  return (
    <div style={{
      background: 'rgba(59, 130, 246, 0.1)',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px',
      border: isActive ? '2px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.3)'
    }}>
      

      </div>
  );
};

export default Step2;

{/* <div style={{
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
          Step 3 of 8
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
        Understanding the Results
      </h4>

      {/* Placeholder content area */}
      // <div style={{
      //   background: 'rgba(255, 255, 255, 0.05)',
      //   padding: '15px',
      //   borderRadius: '8px',
      //   marginBottom: '15px'
      // }}>
      //   <p style={{ color: '#ccc', margin: '0 0 10px 0', fontSize: '14px' }}>
      //     After defining the model, goal, and constraints, we can run the model checker to explore all possible states and transitions. 
      //     This results in a state space that represents all possible configurations of the game. 
      //     A visual graph can be generated to illustrate these states and the transitions between them.
      //   </p>
        
      //   {/* View Graph Button */}
      //   <button
      //     onClick={openGraphInNewTab}
      //     style={{
      //       background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      //       color: 'white',
      //       border: 'none',
      //       padding: '10px 20px',
      //       borderRadius: '6px',
      //       fontSize: '14px',
      //       fontWeight: '500',
      //       cursor: 'pointer',
      //       transition: 'all 0.2s ease',
      //       boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
      //     }}
      //     onMouseOver={(e) => {
      //       e.currentTarget.style.transform = 'translateY(-1px)';
      //       e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
      //     }}
      //     onMouseOut={(e) => {
      //       e.currentTarget.style.transform = 'translateY(0)';
      //       e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
      //     }}
      //   >
      //     📊 View State Space Graph (New Tab)
      //   </button>

      //   <p style={{ color: '#ccc', margin: '0 0 10px 0', fontSize: '14px' }}>
      //     We can now simulate the most optimal path using the model. 
      //     Without going into further explanation we can show that the minimum number of moves required to get all objects across is 7 moves. 
      //     Here is the resultant graph showing the optimal graph.
      //   </p>

      //   {/* View Path Button */}
      //   <button
      //     onClick={() => window.open('/strategy-view.svg', '_blank')}
      //     style={{
      //       background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      //       color: 'white',
      //       border: 'none',
      //       padding: '10px 20px',
      //       borderRadius: '6px',
      //       fontSize: '14px',
      //       fontWeight: '500',
      //       cursor: 'pointer',
      //       transition: 'all 0.2s ease',
      //       boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
      //     }}
      //     onMouseOver={(e) => {
      //       e.currentTarget.style.transform = 'translateY(-1px)';
      //       e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
      //     }}
      //     onMouseOut={(e) => {
      //       e.currentTarget.style.transform = 'translateY(0)';
      //       e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
      //     }}
      //   >
      //     📊 View Optimal Path Graph (New Tab)
      //   </button>
      // </div> */}