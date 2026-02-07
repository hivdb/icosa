import {render, fireEvent, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import style, {useToggleTabs} from '../../../../src/components/vertical-tabs-style';

describe('useToggleTabs', () => {
  it('toggles expansion state', () => {
    function Test() {
      const [expansion, toggle] = useToggleTabs();
      return <div>
        <span data-testid="state">{expansion ? 'open' : 'closed'}</span>
        {toggle}
      </div>;
    }
    render(<Test />);
    const btn = screen.getByRole('switch');
    fireEvent.click(btn);
    expect(screen.getByTestId('state')).toHaveTextContent(/open|closed/);
  });
});
