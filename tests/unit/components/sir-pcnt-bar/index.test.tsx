import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import SIRPcntBar from '../../../../src/components/sir-pcnt-bar';

describe('SIRPcntBar', () => {
  it('renders N/A when all percentages are zero', () => {
    render(<SIRPcntBar levelPcnts={[{level: 'S', pcnt: 0}]} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders level percentages', () => {
    render(<SIRPcntBar levelPcnts={[{level: 'S', pcnt: 0.5}]} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
