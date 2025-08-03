import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

// Markdown relies on ramda's internal paths which are not available in the
// test environment. Stub it out so tests can focus on label rendering.
vi.mock('../markdown', () => ({
  default: ({children}: any) => <>{children}</>
}));

vi.mock('../report', () => ({
  ConfigContext: {
    use: () => [{} as any, false]
  }
}));

import LabelAntibodies from './label-antibodies';

describe('LabelAntibodies', () => {
  it('renders antibody abbreviations joined by plus sign', () => {
    render(
      <LabelAntibodies antibodies={[{name: 'Abc', priority: 1}, {name: 'Def', abbrName: 'D', priority: 2}]} />
    );
    expect(screen.getByText('Abc + D')).toBeInTheDocument();
  });
});
