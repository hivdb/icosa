import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import LegendContext from './index';

// no style imports

function Consumer() {
  const ctx = React.useContext(LegendContext.ContextObj);
  return <button onClick={() => ctx.onUpdate({colorBoxAnnotColorLookup: {a: 'b'}})}>{Object.keys(ctx.colorBoxAnnotColorLookup).length}</button>;
}

describe('LegendContext', () => {
  it('provides updatable color lookup', () => {
    const {getByRole} = render(
      <LegendContext>
        <Consumer />
      </LegendContext>
    );
    const btn = getByRole('button');
    expect(btn.textContent).toBe('0');
    fireEvent.click(btn);
    expect(btn.textContent).toBe('1');
  });
});
