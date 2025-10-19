import React from 'react';

export interface StepComponentProps {
  // Add any common props that all step components might need
  isActive?: boolean;
  onAction?: () => void;
}

const Step0: React.FC<StepComponentProps> = ({ isActive = false }) => {
  return (
    <div>
    <p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
  Let’s get started by turning the classic <strong>Chicken Crossing puzzle</strong> into a model that a computer can understand!  
  <br /><br />
  The goal of <em>model checking</em> is to represent every possible situation in a problem — what we call the <strong>states</strong> — and the actions that move us between them.  
  <br /><br />
  Since this puzzle doesn’t involve any luck or randomness (no dice rolls, no coin flips!), we’ll use a <strong>deterministic model</strong>.  
  That means every action has a predictable outcome — what you see is what you get.
  <br /><br />
  Now, it’s time to decide what makes up a <em>state</em> in our model.  
  Each state will describe where our four characters are:  
  <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    margin: '10px 0'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img src="/Icons/Farmer_Icon.png" alt="Farmer" width="24" height="24" />
      <span>the Farmer</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img src="/Icons/Chicken_Icon.png" alt="Chicken" width="24" height="24" />
      <span>the Chicken</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img src="/Icons/Fox_Icon.png" alt="Fox" width="24" height="24" />
      <span>the Fox</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <img src="/Icons/Grain_Icon.png" alt="Grain" width="24" height="24" />
      <span>the Grain</span>
    </div>
  </div>
  Each one can be on either the <strong>left</strong> or <strong>right</strong> side of the river — giving us four variables, each with two possible values.
  That’s <code>2⁴ = 16</code> total states the model checker will explore!
  <br /><br />
  In PRISM, we describe this setup using variables like this:
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
      f : [0..1] init 0; <span style={{ color: 'green', fontFamily: 'inherit' }}> // Farmer</span><br />
      c : [0..1] init 0; <span style={{ color: 'green', fontFamily: 'inherit' }}> // Chicken</span><br />
      x : [0..1] init 0; <span style={{ color: 'green', fontFamily: 'inherit' }}> // Fox</span><br />
      g : [0..1] init 0; <span style={{ color: 'green', fontFamily: 'inherit' }}> // Grain</span>
    </span>
  </div>
  </div>
  </div>
  );
};

export default Step0;