import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('./style.module.scss', () => ({default: {}}), {virtual: true});

import SIRPcntBar from './index';

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
