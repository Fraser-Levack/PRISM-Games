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
      
    </div>
  );
};

export default Step1;

{/* <div style={{
      background: 'rgba(59, 130, 246, 0.1)',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px',
      border: isActive ? '2px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.3)'
    }}>
      
    <p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
  Now that we’ve built the model, it’s time to make it <strong>do something</strong>!  
  We’ll define which situations are safe, which are dangerous, and what actions the <img src="/Icons/Farmer_Icon.png" alt="Farmer" width="20" height="20" style={{ verticalAlign: 'middle' }} /> <strong>Farmer</strong> can take.
  <br /><br />
  Just like in the real puzzle, there are two disaster scenarios we want to avoid:
</p>

<div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '10px',
  margin: '10px 0'
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <img src="/Icons/Fox_Icon.png" alt="Fox" width="24" height="24" />
    <span> <strong>Fox</strong> eats the <img src="/Icons/Chicken_Icon.png" alt="Chicken" width="20" height="20" style={{ verticalAlign: 'middle' }} /> Chicken! </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <img src="/Icons/Chicken_Icon.png" alt="Chicken" width="24" height="24" />
    <span> <strong>Chicken</strong> eats the <img src="/Icons/Grain_Icon.png" alt="Grain" width="20" height="20" style={{ verticalAlign: 'middle' }} /> Grain! </span>
  </div>
</div>

<p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
  We can describe those “uh oh” situations as formulas in PRISM — when they’re true, the system knows we’ve reached an <strong>unsafe state</strong>:
</p>

<div
  style={{
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#3b82f6',
    margin: '10px 0',
    display: 'flex',
    justifyContent: 'center'
  }}
>
  <div style={{ textAlign: 'left' }}>
    <span>
      formula unsafe = ((c = x) & (f != c)) | ((c = g) & (f != c)); <br />
      formula safe = !unsafe; <br />
    </span>
  </div>
</div>

<p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
  So the model checker will avoid any state where the <img src="/Icons/Chicken_Icon.png" alt="Chicken" width="20" height="20" style={{ verticalAlign: 'middle' }} /> Chicken ends up alone with either the <img src="/Icons/Fox_Icon.png" alt="Fox" width="20" height="20" style={{ verticalAlign: 'middle' }} /> Fox or the <img src="/Icons/Grain_Icon.png" alt="Grain" width="20" height="20" style={{ verticalAlign: 'middle' }} /> Grain.  
  <br /><br />
  Next, we’ll define our <strong>goal</strong> — the happy ending where everyone makes it safely to the other side of the river:
</p>

<div
  style={{
    fontFamily: 'monospace',
    fontSize: '14px',
    color: '#3b82f6',
    margin: '10px 0',
    display: 'flex',
    justifyContent: 'center'
  }}
>
  <div style={{ textAlign: 'left' }}>
    <span>
      label "goal" = (f = 1 & c = 1 & x = 1 & g = 1); <br />
    </span>
  </div>
</div>

<p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
  Finally, we’ll tell PRISM what moves are allowed — the actions the <img src="/Icons/Farmer_Icon.png" alt="Farmer" width="20" height="20" style={{ verticalAlign: 'middle' }} /> <strong>Farmer</strong> can take.  
  Each command flips the positions of the <strong>Farmer</strong> and whichever passenger (if any) they choose to bring across.
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
      [move_none] safe -{'>'} (f' = 1 - f); <br />
      [move_chicken] safe & (c = f) -{'>'} (f' = 1 - f) & (c' = 1 - c); <br />
      [move_fox] safe & (x = f) -{'>'} (f' = 1 - f) & (x' = 1 - x); <br />
      [move_grain] safe & (g = f) -{'>'} (f' = 1 - f) & (g' = 1 - g); <br />
    </span>
  </div>
</div>

<p style={{ color: '#ccc', margin: '0', fontSize: '14px' }}>
  Each line represents a possible action: move alone, or bring one of your companions.  
  The model checker will explore all combinations to find a safe path to the goal — without any feathers (or grain) getting ruffled.
</p>

    </div> */}