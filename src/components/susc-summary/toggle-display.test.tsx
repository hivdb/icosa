import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import useToggleDisplay, {ToggleDisplayButton} from './toggle-display';

function TestComponent({rows}: {rows: Array<{id: number; displayOrder: number}>}) {
  const {rows: displayRows, button} = useToggleDisplay(rows);
  return (
    <div>
      <ul data-testid="rows">
        {displayRows.map(r => (
          <li key={r.id}>{r.id}</li>
        ))}
      </ul>
      {button}
    </div>
  );
}

describe('useToggleDisplay', () => {
  it('toggles rows based on displayOrder', () => {
    const rows = [
      {id: 1, displayOrder: 0},
      {id: 2, displayOrder: 1}
    ];
    render(<TestComponent rows={rows} />);
    expect(screen.getAllByRole('listitem').length).toBe(1);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getAllByRole('listitem').length).toBe(2);
  });

  it('ToggleDisplayButton hides when no rows', () => {
    const {container} = render(
      <ToggleDisplayButton expanded={false} onToggle={() => {}} numRemainRows={0} />
    );
    expect(container.firstChild).toBeNull();
  });
});
