import {describe, test, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import NGSResults from '../../../../src/components/ngs2codfreq/results';
import type {ProgressPayload} from '../../../../src/components/ngs2codfreq/types';

vi.mock('../../../../src/utils/download', () => ({
  useDownload: () => ({
    onInit: vi.fn(),
    onAddFile: vi.fn(),
    onFinish: vi.fn(),
    loadedFiles: [],
    isDownloading: false
  })
}));

vi.mock('../../../../src/utils/fastq2codfreq', () => ({
  downloadCodfreqs: vi.fn(),
  saveAllFiles: vi.fn()
}));

vi.mock('../../../../src/components/loader', () => ({
  default: ({inline}: {inline?: boolean}) => <div data-testid="loader">Loading...</div>
}));

describe('NGSResults component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders progress list', () => {
    const progressLookup: Record<string, ProgressPayload> = {
      step1: {step: 'step1', description: 'Processing files', count: 1, total: 1}
    };
    render(<NGSResults progressLookup={progressLookup} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  test('displays progress descriptions', () => {
    const progressLookup: Record<string, ProgressPayload> = {
      step1: {step: 'step1', description: 'Processing files', count: 5, total: 10},
      step2: {step: 'step2', description: 'Analyzing data', count: 3, total: 5}
    };
    render(<NGSResults progressLookup={progressLookup} />);
    expect(screen.getByText('Processing files')).toBeInTheDocument();
    expect(screen.getByText('Analyzing data')).toBeInTheDocument();
  });

  test('displays progress counts when total > 1', () => {
    const progressLookup: Record<string, ProgressPayload> = {
      step1: {step: 'step1', description: 'Processing', count: 5, total: 10}
    };
    render(<NGSResults progressLookup={progressLookup} />);
    expect(screen.getByText(/\(5\/10\)/)).toBeInTheDocument();
  });

  test('hides progress counts when total is 1', () => {
    const progressLookup: Record<string, ProgressPayload> = {
      step1: {step: 'step1', description: 'Processing', count: 1, total: 1}
    };
    render(<NGSResults progressLookup={progressLookup} />);
    expect(screen.queryByText(/\(1\/1\)/)).not.toBeInTheDocument();
  });

  test('shows download buttons when codfreqs are available', () => {
    const progressLookup: Record<string, ProgressPayload> = {
      'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}, {}]}
    };
    render(<NGSResults progressLookup={progressLookup} />);
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText(/Download all files/i)).toBeInTheDocument();
  });

  test('displays correct codfreq count', () => {
    const progressLookup: Record<string, ProgressPayload> = {
      'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}, {}, {}]}
    };
    render(<NGSResults progressLookup={progressLookup} />);
    expect(screen.getByText(/3 CodFreq files/i)).toBeInTheDocument();
  });

  test('shows analyze button when onAnalyze is provided', () => {
    const progressLookup: Record<string, ProgressPayload> = {
      'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}]}
    };
    const onAnalyze = vi.fn();
    render(<NGSResults progressLookup={progressLookup} onAnalyze={onAnalyze} />);
    expect(screen.getByText('Analyze')).toBeInTheDocument();
  });

  test('hides analyze button when onAnalyze is not provided', () => {
    const progressLookup: Record<string, ProgressPayload> = {
      'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}]}
    };
    render(<NGSResults progressLookup={progressLookup} />);
    expect(screen.queryByText('Analyze')).not.toBeInTheDocument();
  });

  test('calls onAnalyze when analyze button is clicked', async () => {
    const codfreqs = [{data: 'test1'}, {data: 'test2'}];
    const progressLookup: Record<string, ProgressPayload> = {
      'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs}
    };
    const onAnalyze = vi.fn();
    render(<NGSResults progressLookup={progressLookup} onAnalyze={onAnalyze} />);
    
    const analyzeButton = screen.getByText('Analyze');
    fireEvent.click(analyzeButton);
    
    await waitFor(() => {
      expect(onAnalyze).toHaveBeenCalledWith(codfreqs);
    });
  });

  test('calls downloadCodfreqs when download button is clicked', async () => {
    const {downloadCodfreqs} = await import('../../../../src/utils/fastq2codfreq');
    const progressLookup: Record<string, ProgressPayload> = {
      'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}]}
    };
    render(<NGSResults taskKey="test-task" progressLookup={progressLookup} />);
    
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(downloadCodfreqs).toHaveBeenCalledWith('test-task');
    });
  });

  test('applies custom className', () => {
    const progressLookup: Record<string, ProgressPayload> = {
      step1: {step: 'step1', description: 'Test', count: 1, total: 1}
    };
    const {container} = render(<NGSResults progressLookup={progressLookup} className="custom" />);
    expect(container.querySelector('.custom__results-container')).toBeInTheDocument();
  });
});
