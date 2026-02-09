import React from 'react';
import {describe, test, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('found', () => ({
  Link: ({to, children}: any) => <a href={to}>{children}</a>
}));

vi.mock('../../../../src/components/analyze-forms/patterns-input-form', () => ({
  default: ({to}: any) => <div data-testid="patterns-form">Patterns to {to}</div>
}));

vi.mock('../../../../src/components/analyze-forms/sequence-input-form', () => ({
  default: ({to}: any) => <div data-testid="sequence-form">Sequences to {to}</div>
}));

vi.mock('../../../../src/components/analyze-forms/sequence-reads-input-form', () => ({
  default: ({to}: any) => <div data-testid="reads-form">Reads to {to}</div>
}));

vi.mock('../../../../src/components/analyze-forms/ngs2codfreq-form', () => ({
  default: ({showOptionsForm, analyzeTo}: any) => (
    <div data-testid="ngs2codfreq-form">
      NGS2CodFreq {showOptionsForm ? 'options' : 'hidden'} to {analyzeTo}
    </div>
  )
}));

import AnalyzeForms from '../../../../src/components/analyze-forms';

describe('AnalyzeForms', () => {
  const mockRouter = {
    replace: vi.fn(),
    push: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders patterns tab by default', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/by-patterns/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       readsTo="/reads-result"
      />
    );

    expect(screen.getByText('Input mutations')).toBeInTheDocument();
    expect(screen.getByTestId('patterns-form')).toBeInTheDocument();
  });

  test('renders sequences tab when pathname matches', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/by-sequences/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       readsTo="/reads-result"
      />
    );

    expect(screen.getByText('Input sequences')).toBeInTheDocument();
    expect(screen.getByTestId('sequence-form')).toBeInTheDocument();
  });

  test('renders reads tab when pathname matches', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/by-reads/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       readsTo="/reads-result"
      />
    );

    expect(screen.getByText('Input sequence reads')).toBeInTheDocument();
    expect(screen.getByTestId('reads-form')).toBeInTheDocument();
    expect(screen.getByTestId('ngs2codfreq-form')).toBeInTheDocument();
  });

  test('renders ngs2codfreq tab with options form', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/ngs2codfreq/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       readsTo="/reads-result"
      />
    );

    expect(screen.getByTestId('ngs2codfreq-form')).toBeInTheDocument();
    expect(screen.getByText(/NGS2CodFreq options/)).toBeInTheDocument();
  });

  test('redirects to base path when invalid tab', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/invalid-tab/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       readsTo="/reads-result"
      />
    );

    expect(mockRouter.replace).toHaveBeenCalledWith('/analyze/');
  });

  test('respects enableTabs prop', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/by-patterns/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       enableTabs={['patterns', 'sequences']}
      />
    );

    expect(screen.getByText('Input mutations')).toBeInTheDocument();
    expect(screen.getByText('Input sequences')).toBeInTheDocument();
    expect(screen.queryByText('Input sequence reads')).not.toBeInTheDocument();
  });

  test('passes outputOptions to sequence form', () => {
    const outputOptions = {test: {label: 'Test'}};
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/by-sequences/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       sequencesOutputOptions={outputOptions}
      />
    );

    expect(screen.getByTestId('sequence-form')).toBeInTheDocument();
  });

  test('renders ngs2codfreqSide when on ngs2codfreq tab', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/ngs2codfreq/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       readsTo="/reads-result"
       ngs2codfreqSide={<div data-testid="sidebar">Sidebar</div>}
      />
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  test('does not render ngs2codfreqSide on other tabs', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/by-patterns/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       ngs2codfreqSide={<div data-testid="sidebar">Sidebar</div>}
      />
    );

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  test('passes children to forms', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/by-patterns/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result">
        <div data-testid="child-content">Child Content</div>
      </AnalyzeForms>
    );

    expect(screen.getByTestId('patterns-form')).toBeInTheDocument();
  });

  test('does not redirect when on ngs2codfreq tab', () => {
    render(
      <AnalyzeForms
       match={{location: {pathname: '/analyze/ngs2codfreq/'}}}
       router={mockRouter}
       basePath="/analyze"
       patternsTo="/patterns-result"
       sequencesTo="/sequences-result"
       readsTo="/reads-result"
      />
    );

    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
