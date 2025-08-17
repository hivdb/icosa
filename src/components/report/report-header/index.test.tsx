import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import ReportHeader from './index';

describe('ReportHeader', () => {
  it('observes and disconnects when output is not printable', () => {
    const onObserve = vi.fn();
    const onDisconnect = vi.fn();
    const {unmount} = render(
      <ReportHeader
        output="default"
        name="Sequence Summary"
        index={0}
        onObserve={onObserve}
        onDisconnect={onDisconnect}
      />
    );
    expect(onObserve).toHaveBeenCalledTimes(1);
    const payload = onObserve.mock.calls[0][0];
    expect(payload.name).toBe('Sequence Summary');
    unmount();
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it('skips observation when output is printable', () => {
    const onObserve = vi.fn();
    render(
      <ReportHeader
        output="printable"
        name="Printable Section"
        index={1}
        onObserve={onObserve}
      />
    );
    expect(onObserve).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(
      '2. Printable'
    );
  });
});
