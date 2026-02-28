import {describe, test, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import NGSResults from '../../../../src/components/ngs2codfreq/results';
import type {ProgressPayload} from '../../../../src/components/ngs2codfreq/types';

const mockUseDownload = vi.fn(() => ({
  onInit: vi.fn(),
  onAddFile: vi.fn(),
  onFinish: vi.fn(),
  loadedFiles: [],
  isDownloading: false
}));

vi.mock('../../../../src/utils/download', () => ({
  useDownload: () => mockUseDownload()
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

  describe('Download All Files', () => {
    test('calls saveAllFiles when download all button is clicked with showDirectoryPicker support', async () => {
      const {saveAllFiles} = await import('../../../../src/utils/fastq2codfreq');
      const progressLookup: Record<string, ProgressPayload> = {
        'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}]}
      };
      
      // Mock showDirectoryPicker support
      Object.defineProperty(window, 'showDirectoryPicker', {
        value: vi.fn(),
        writable: true,
        configurable: true
      });

      render(<NGSResults taskKey="test-task" progressLookup={progressLookup} />);

      const downloadAllButton = screen.getByText(/Download all files/i);
      fireEvent.click(downloadAllButton);

      await waitFor(() => {
        expect(saveAllFiles).toHaveBeenCalledWith('test-task', expect.any(Object));
      });

      // Cleanup
      delete (window as any).showDirectoryPicker;
    });

    test('shows confirmation dialog when showDirectoryPicker is not supported', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const {saveAllFiles} = await import('../../../../src/utils/fastq2codfreq');
      const progressLookup: Record<string, ProgressPayload> = {
        'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}]}
      };

      // Ensure showDirectoryPicker is not defined
      delete (window as any).showDirectoryPicker;

      render(<NGSResults taskKey="test-task" progressLookup={progressLookup} />);

      const downloadAllButton = screen.getByText(/Download all files/i);
      fireEvent.click(downloadAllButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
        expect(confirmSpy.mock.calls[0][0]).toContain('not yet supported by your browser');
      });

      confirmSpy.mockRestore();
    });

    test('cancels download when user declines confirmation', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const {saveAllFiles} = await import('../../../../src/utils/fastq2codfreq');
      const progressLookup: Record<string, ProgressPayload> = {
        'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}]}
      };

      delete (window as any).showDirectoryPicker;

      render(<NGSResults taskKey="test-task" progressLookup={progressLookup} />);

      const downloadAllButton = screen.getByText(/Download all files/i);
      fireEvent.click(downloadAllButton);

      await waitFor(() => {
        expect(confirmSpy).toHaveBeenCalled();
      });

      expect(saveAllFiles).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Download Progress', () => {
    test('shows loader when downloading', () => {
      mockUseDownload.mockReturnValueOnce({
        onInit: vi.fn(),
        onAddFile: vi.fn(),
        onFinish: vi.fn(),
        loadedFiles: [],
        isDownloading: true
      });

      const progressLookup: Record<string, ProgressPayload> = {
        'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}]}
      };

      render(<NGSResults taskKey="test-task" progressLookup={progressLookup} />);
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    test('displays loaded files during download', () => {
      mockUseDownload.mockReturnValueOnce({
        onInit: vi.fn(),
        onAddFile: vi.fn(),
        onFinish: vi.fn(),
        loadedFiles: ['file1.bam', 'file2.fastq', 'file3.codfreq'],
        isDownloading: true
      } as any);

      const progressLookup: Record<string, ProgressPayload> = {
        'finish-task': {step: 'finish-task', description: 'Complete', count: 1, total: 1, codfreqs: [{}]}
      };

      render(<NGSResults taskKey="test-task" progressLookup={progressLookup} />);
      
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      expect(screen.getByText('file1.bam')).toBeInTheDocument();
      expect(screen.getByText('file2.fastq')).toBeInTheDocument();
      expect(screen.getByText('file3.codfreq')).toBeInTheDocument();
    });
  });
});
