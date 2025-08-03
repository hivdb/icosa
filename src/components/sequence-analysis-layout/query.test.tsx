import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import gql from 'graphql-tag';

import SequenceAnalysisQuery from './query';

vi.mock('../cumu-query', () => ({
  default: vi.fn(() => ({
    loaded: true,
    error: null,
    data: {
      currentVersion: { text: 'v1' },
      currentProgramVersion: { text: 'pv1' },
      sequenceAnalysis: [{ inputSequence: { header: 'h1' } }],
    },
    extVariables: {},
    progressObj: { progress: 1, nextProgress: 1, total: 1 },
    fetchAnother: vi.fn(),
  })),
}));

vi.mock('../loader', () => ({ default: () => <div data-testid="loader" /> }));
vi.mock('../smooth-progress-bar', () => ({ default: () => <div data-testid="progress" /> }));

describe('SequenceAnalysisQuery', () => {
  it('renders children when loaded', () => {
    const child = vi.fn(() => <div data-testid="child">child</div>);
    const fragment = gql`fragment Dummy on Root { __typename }`;
    render(
      <SequenceAnalysisQuery
        lazyLoad
        quickLoadLimit={2}
        renderPartialResults
        query={fragment}
        sequences={[{ inputSequence: { header: 'h1' } }]}
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

