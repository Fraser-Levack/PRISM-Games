import React from 'react';

export interface StepComponentProps {
  // Add any common props that all step components might need
  isActive?: boolean;
  onAction?: () => void;
}

const Step0: React.FC<StepComponentProps> = ({ isActive = false }) => {
  return (
    <div style={{
      background: 'rgba(52, 29, 54, 0.4)',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px',
      border: isActive ? '2px solid #c8c1f0' : '1px solid rgba(59, 130, 246, 0.3)'
    }}>
    <p style={{ color: '#ccc', margin: '0', fontSize: '16px' }}>
  Let’s get started by turning the classic <strong>Chicken Crossing puzzle</strong> into a model that a computer can understand!  
  <br /><br />
  The goal of <em>model checking</em> is to represent every possible situation in a problem — what we call the <strong>states</strong> — and the actions that move us between them.  
  <br /><br />
  Since this puzzle doesn’t involve any luck or randomness (no dice rolls, no coin flips!), we’ll use a <strong>deterministic model</strong>.  
  That means every action has a predictable outcome — what you see is what you get.
  <br /><br />
  Now, it’s time to decide what makes up a <em>state</em> in our model.  
  Each state will describe where our four characters are:  
  </p>
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    margin: '10px 0'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img src="/Icons/Farmer_Icon.png" alt="Farmer" width="30" height="30" />
      <span>the Farmer</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img src="/Icons/Chicken_Icon.png" alt="Chicken" width="30" height="30" />
      <span>the Chicken</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img src="/Icons/Fox_Icon.png" alt="Fox" width="30" height="30" />
      <span>the Fox</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img src="/Icons/Grain_Icon.png" alt="Grain" width="30" height="30" />
      <span>the Grain</span>
    </div>
  </div>
  <p>
  Each one can be on either the <strong>left</strong> or <strong>right</strong> side of the river — giving us four variables, each with two possible values.
  That’s <code>2⁴ = 16</code> total states the model checker will explore! (However some are inaccessible.)
</p>

</div>
  );
};

export default Step0;