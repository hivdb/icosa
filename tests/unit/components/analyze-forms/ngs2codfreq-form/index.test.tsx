import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';

const mockPush = vi.fn();
const mockRouterState = {
  router: {push: mockPush},
  match: {location: {query: {}}}
};

vi.mock('found', () => ({
  useRouter: () => mockRouterState
}));

vi.mock('../../../../../src/utils/sequence-reads', () => ({
  buildGeneValidator: vi.fn()
}));

vi.mock('../../../../../src/utils/big-data', () => ({
  default: {
    clear: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue('big-data-key')
  }
}));

vi.mock('../../../../../src/components/ngs2codfreq', () => ({
  default: ({onAnalyze, onTriggerRunner}: any) => (
    <div>
      <button onClick={() => onAnalyze([{name: 'test.codfreq', allReads: []}])}>Analyze</button>
      <button onClick={() => onTriggerRunner('new-task')}>Trigger</button>
    </div>
  )
}));

vi.mock('../../../../../src/utils/config-context', () => ({
  default: {
    use: () => [{geneValidatorDefs: [{gene: 'PR', start: 1, end: 99}]}, false]
  }
}));

import {reformCodFreqs} from '../../../../../src/components/analyze-forms/ngs2codfreq-form';
import NGS2CodFreqForm from '../../../../../src/components/analyze-forms/ngs2codfreq-form';
import * as sequenceReadsUtils from '../../../../../src/utils/sequence-reads';

const mockGeneValidator = vi.fn((g: string, p: number) => [g, p]);
const mockBuildGeneValidator = vi.mocked(sequenceReadsUtils.buildGeneValidator);

describe('reformCodFreqs', () => {
  it('reforms codfreq structure', () => {
    const input = [{
      name: 'sample.codfreq',
      allReads: [{allCodonReads: [{codon: 'AAA', reads: 1}], gene: 'PR', position: 1}]
    }];
    const result = reformCodFreqs(input, (g: string, p: number) => [g, p]);
    expect(result[0].name).toBe('sample');
    expect(result[0].allReads[0].allCodonReads[0]).toEqual({codon: 'AAA', reads: 1});
  });

  it('removes file extensions from names', () => {
    const input = [{
      name: 'sample.codfreq.txt',
      allReads: []
    }];
    const result = reformCodFreqs(input, (g, p) => [g, p]);
    expect(result[0].name).toBe('sample');
  });

  it('handles null gene and position', () => {
    const input = [{
      name: 'test',
      allReads: [{allCodonReads: [], gene: null, position: null}]
    }];
    const result = reformCodFreqs(input, (g, p) => ['validated', 10]);
    expect(result[0].allReads[0].gene).toBeNull();
    expect(result[0].allReads[0].position).toBeNull();
  });

  it('validates gene and position when not null', () => {
    const validator = vi.fn((g: string, p: number) => ['validated-gene', 100]);
    const input = [{
      name: 'test',
      allReads: [{allCodonReads: [], gene: 'PR', position: 50}]
    }];
    const result = reformCodFreqs(input, validator);
    expect(validator).toHaveBeenCalledWith('PR', 50);
    expect(result[0].allReads[0].gene).toBe('validated-gene');
    expect(result[0].allReads[0].position).toBe(100);
  });

  it('preserves extra properties', () => {
    const input = [{
      name: 'test',
      allReads: [{allCodonReads: [], gene: 'PR', position: 1, extra: 'data'}],
      metadata: 'preserved'
    }];
    const result = reformCodFreqs(input, (g, p) => [g, p]);
    expect(result[0].metadata).toBe('preserved');
    expect(result[0].allReads[0].extra).toBe('data');
  });
});

describe('NGS2CodFreqForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterState.match.location.query = {};
  });

  it('renders NGS2CodFreq component', () => {
    render(<NGS2CodFreqForm analyzeTo="/analyze" />);
    expect(screen.getByText('Analyze')).toBeTruthy();
  });

  it('passes props to NGS2CodFreq', () => {
    const runners = [{name: 'runner1'}];
    render(
      <NGS2CodFreqForm 
        showOptionsForm={true}
        runners={runners}
        analyzeTo="/analyze"
      />
    );
    expect(screen.getByText('Analyze')).toBeTruthy();
    expect(screen.getByText('Trigger')).toBeTruthy();
  });

  it('renders analyze and trigger buttons', () => {
    render(<NGS2CodFreqForm redirectTo="/redirect" analyzeTo="/analyze" />);
    expect(screen.getByText('Analyze')).toBeTruthy();
    expect(screen.getByText('Trigger')).toBeTruthy();
  });

  it('calls handleAnalyze and redirects when Analyze button clicked', async () => {
    render(<NGS2CodFreqForm analyzeTo="/analyze" />);

    const analyzeBtn = screen.getByText('Analyze');
    analyzeBtn.click();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/analyze',
        state: expect.objectContaining({
          allSequenceReads: 'big-data-key',
          outputOption: 'default'
        })
      });
    });
  });

  it('calls handleTriggerRunner and redirects when taskKey differs', async () => {
    mockRouterState.match.location.query = {task: 'old-task'};

    render(<NGS2CodFreqForm redirectTo="/redirect" analyzeTo="/analyze" />);

    const triggerBtn = screen.getByText('Trigger');
    triggerBtn.click();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/redirect',
        query: {task: 'new-task'}
      });
    });
  });

  it('does not redirect when taskKey matches current task', () => {
    mockRouterState.match.location.query = {task: 'new-task'};

    render(<NGS2CodFreqForm redirectTo="/redirect" analyzeTo="/analyze" />);

    const triggerBtn = screen.getByText('Trigger');
    const initialCallCount = mockPush.mock.calls.length;
    triggerBtn.click();

    expect(mockPush).toHaveBeenCalledTimes(initialCallCount);
  });

  it('does not redirect when redirectTo is not provided', () => {
    mockRouterState.match.location.query = {task: 'old-task'};

    render(<NGS2CodFreqForm analyzeTo="/analyze" />);

    const triggerBtn = screen.getByText('Trigger');
    const initialCallCount = mockPush.mock.calls.length;
    triggerBtn.click();

    expect(mockPush).toHaveBeenCalledTimes(initialCallCount);
  });
});

