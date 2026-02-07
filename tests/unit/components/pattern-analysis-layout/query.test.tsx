import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import gql from 'graphql-tag';

import PatternAnalysisQuery from '../../../../src/components/pattern-analysis-layout/query';

vi.mock('../../../../src/components/cumu-query', () => ({
  default: vi.fn(() => ({
    loaded: true,
    error: null,
    data: {
      currentVersion: { text: 'v1' },
      currentProgramVersion: { text: 'pv1' },
      patternAnalysis: [{ name: 'p1' }],
    },
    progressObj: { progress: 1, nextProgress: 1, total: 1 },
    fetchAnother: vi.fn(),
  })),
}));

vi.mock('../../../../src/components/loader', () => ({ default: () => <div data-testid="loader" /> }));
vi.mock('../../../../src/components/smooth-progress-bar', () => ({ default: () => <div data-testid="progress" /> }));

describe('PatternAnalysisQuery', () => {
  it('renders children when loaded', () => {
    const child = vi.fn(() => <div data-testid="child">child</div>);
    const fragment = gql`fragment Dummy on Root { __typename }`;
    render(
      <PatternAnalysisQuery
        renderPartialResults
        query={fragment}
        patterns={[{ name: 'A', mutations: ['A'] }]}
        initOffset={0}
        initLimit={1}
        children={child}
        client={{}}
        progressText={() => ''}
        showProgressBar
        onExtendVariables={(v) => v}
      />
    );
    expect(child).toHaveBeenCalled();
    expect(screen.getByTestId('child')).toBeTruthy();
    expect(screen.getByTestId('progress')).toBeTruthy();
  });
});

