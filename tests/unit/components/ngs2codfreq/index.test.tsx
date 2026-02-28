import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import NGS2CodFreq from '../../../../src/components/ngs2codfreq/index';
import type {FastqPair} from '../../../../src/components/ngs2codfreq/types';

// Mock dependencies
vi.mock('../../../../src/utils/fastq2codfreq', () => ({
  default: vi.fn(),
  restoreTask: vi.fn()
}));

vi.mock('../../../../src/components/ngs2codfreq/upload-form', () => ({
  default: vi.fn(() => <div data-testid="upload-form">Upload Form</div>)
}));

vi.mock('../../../../src/components/ngs2codfreq/options-form', () => ({
  default: vi.fn(() => <div data-testid="options-form">Options Form</div>)
}));

vi.mock('../../../../src/components/ngs2codfreq/results', () => ({
  default: vi.fn(() => <div data-testid="results">Results</div>)
}));

vi.mock('../../../../src/components/ngs2codfreq/use-options', () => ({
  default: vi.fn()
}));

import fastq2codfreq, {restoreTask} from '../../../../src/utils/fastq2codfreq';
import UploadForm from '../../../../src/components/ngs2codfreq/upload-form';
import OptionsForm from '../../../../src/components/ngs2codfreq/options-form';
import NGSResults from '../../../../src/components/ngs2codfreq/results';
import useOptions from '../../../../src/components/ngs2codfreq/use-options';

describe('NGS2CodFreq', () => {
  const mockOptions = {
    fastpConfig: {
      includeUnmerged: true,
      qualifiedQualityPhred: 15,
      unqualifiedPercentLimit: 40,
      nBaseLimit: 5,
      averageQual: 0,
      lengthRequired: 15,
      lengthLimit: 0,
      adapterSequence: 'auto',
      adapterSequenceR2: 'auto',
      disableAdapterTrimming: false,
      disableTrimPolyG: false,
      disableQualityFiltering: false,
      disableLengthFiltering: false
    },
    cutadaptConfig: {
      primerSeqs: [],
      errorRate: 0.1,
      noIndels: true,
      times: 1,
      minOverlap: 3
    },
    ivarConfig: {
      primerBeds: [],
      minLength: 0,
      minQuality: 0,
      includeReadsWithNoPrimers: true
    },
    primerType: 'off' as const,
    saveInBrowser: false
  };

  const mockSetOptions = vi.fn();
  const mockIsOptionsDefault = true;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOptions).mockReturnValue([
      mockOptions,
      mockSetOptions,
      mockIsOptionsDefault
    ]);
    vi.mocked(restoreTask).mockReturnValue((async function* () {})() as any);
    vi.mocked(fastq2codfreq).mockReturnValue((async function* () {})() as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders upload form when no task is in progress', () => {
      render(<NGS2CodFreq />);
      expect(screen.getByTestId('upload-form')).toBeInTheDocument();
    });

    it('renders upload form with correct props', () => {
      render(<NGS2CodFreq showOptionsForm={false} className="test-class" />);
      
      expect(UploadForm).toHaveBeenCalledWith(
        expect.objectContaining({
          isOptionsDefault: true,
          showOptionsForm: false,
          className: 'test-class',
          onSubmit: expect.any(Function)
        }),
        undefined
      );
    });

    it('does not render options form when showOptionsForm is false', () => {
      render(<NGS2CodFreq showOptionsForm={false} />);
      expect(screen.queryByTestId('options-form')).not.toBeInTheDocument();
    });

    it('renders options form when showOptionsForm is true', () => {
      render(<NGS2CodFreq showOptionsForm={true} />);
      expect(screen.getByTestId('options-form')).toBeInTheDocument();
    });

    it('passes options to options form', () => {
      render(<NGS2CodFreq showOptionsForm={true} />);
      
      expect(OptionsForm).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockOptions,
          isDefault: true,
          onChange: mockSetOptions
        }),
        undefined
      );
    });
  });

  describe('Task Restoration', () => {
    it('restores task when taskKey is provided', async () => {
      const mockProgress = {
        step: 'processing',
        description: 'Processing files',
        count: 1,
        total: 10
      };

      vi.mocked(restoreTask).mockReturnValue((async function* () {
        yield mockProgress;
      })() as any);

      render(<NGS2CodFreq taskKey="test-task-key" />);

      await waitFor(() => {
        expect(restoreTask).toHaveBeenCalledWith('test-task-key');
      });
    });

    it('calls onTriggerRunner when step is trigger-runner', async () => {
      const onTriggerRunner = vi.fn().mockReturnValue(undefined);
      const mockProgress = {
        step: 'trigger-runner',
        taskKey: 'test-task',
        description: 'Triggering runner',
        count: 1,
        total: 1
      };

      vi.mocked(restoreTask).mockReturnValue((async function* () {
        yield mockProgress;
      })() as any);

      render(<NGS2CodFreq taskKey="test-task-key" onTriggerRunner={onTriggerRunner} />);

      await waitFor(() => {
        expect(onTriggerRunner).toHaveBeenCalledWith('test-task');
      });
    });

    it('stops processing when onTriggerRunner returns false', async () => {
      const onTriggerRunner = vi.fn().mockReturnValue(false);
      const mockProgress1 = {
        step: 'trigger-runner',
        taskKey: 'test-task',
        description: 'Triggering runner',
        count: 1,
        total: 1
      };
      const mockProgress2 = {
        step: 'next-step',
        description: 'Should not reach here',
        count: 2,
        total: 2
      };

      let yieldCount = 0;
      vi.mocked(restoreTask).mockReturnValue((async function* () {
        yield mockProgress1;
        yieldCount++;
        yield mockProgress2;
        yieldCount++;
      })() as any);

      render(<NGS2CodFreq taskKey="test-task-key" onTriggerRunner={onTriggerRunner} />);

      await waitFor(() => {
        expect(onTriggerRunner).toHaveBeenCalled();
      });

      // Give it time to potentially yield more
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(yieldCount).toBeLessThanOrEqual(1);
    });

    it('calls onLoad when task is loaded', async () => {
      const onLoad = vi.fn();
      const mockCodfreqs = [{data: 'test'}];
      const mockProgress = {
        step: 'complete',
        description: 'Complete',
        count: 10,
        total: 10,
        loaded: true,
        codfreqs: mockCodfreqs
      };

      vi.mocked(restoreTask).mockReturnValue((async function* () {
        yield mockProgress;
      })() as any);

      render(<NGS2CodFreq taskKey="test-task-key" onLoad={onLoad} />);

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalledWith(mockCodfreqs);
      });
    });

    it('renders results when create-task step exists', async () => {
      const mockProgress = {
        step: 'create-task',
        description: 'Task created',
        count: 1,
        total: 1
      };

      vi.mocked(restoreTask).mockReturnValue((async function* () {
        yield mockProgress;
      })() as any);

      render(<NGS2CodFreq taskKey="test-task-key" />);

      await waitFor(() => {
        expect(screen.getByTestId('results')).toBeInTheDocument();
      });
    });
  });

  describe('File Submission', () => {
    it('processes fastq pairs when submitted', async () => {
      const mockPairs: FastqPair[] = [
        {
          name: 'test',
          pair: [new File([''], 'test.fastq'), null],
          pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
          n: 1
        }
      ];

      let onSubmitCallback: ((pairs: FastqPair[]) => void) | undefined;
      vi.mocked(UploadForm).mockImplementation((props) => {
        onSubmitCallback = props.onSubmit;
        return <div data-testid="upload-form">Upload Form</div>;
      });

      vi.mocked(fastq2codfreq).mockReturnValue((async function* () {
        yield {step: 'processing', description: 'Processing', count: 1, total: 1};
      })() as any);

      render(<NGS2CodFreq />);

      expect(onSubmitCallback).toBeDefined();
      await onSubmitCallback!(mockPairs);

      await waitFor(() => {
        expect(fastq2codfreq).toHaveBeenCalledWith(
          mockPairs,
          undefined,
          expect.objectContaining({
            fastpConfig: mockOptions.fastpConfig
          })
        );
      });
    });

    it('includes cutadaptConfig when primerType is fasta', async () => {
      const mockOptionsWithFasta = {
        ...mockOptions,
        primerType: 'fasta' as const
      };

      vi.mocked(useOptions).mockReturnValue([
        mockOptionsWithFasta,
        mockSetOptions,
        mockIsOptionsDefault
      ]);

      const mockPairs: FastqPair[] = [
        {
          name: 'test',
          pair: [new File([''], 'test.fastq'), null],
          pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
          n: 1
        }
      ];

      let onSubmitCallback: ((pairs: FastqPair[]) => void) | undefined;
      vi.mocked(UploadForm).mockImplementation((props) => {
        onSubmitCallback = props.onSubmit;
        return <div data-testid="upload-form">Upload Form</div>;
      });

      vi.mocked(fastq2codfreq).mockReturnValue((async function* () {})() as any);

      render(<NGS2CodFreq />);

      await onSubmitCallback!(mockPairs);

      await waitFor(() => {
        expect(fastq2codfreq).toHaveBeenCalledWith(
          mockPairs,
          undefined,
          expect.objectContaining({
            fastpConfig: mockOptionsWithFasta.fastpConfig,
            cutadaptConfig: mockOptionsWithFasta.cutadaptConfig
          })
        );
      });
    });

    it('includes ivarConfig when primerType is bed', async () => {
      const mockOptionsWithBed = {
        ...mockOptions,
        primerType: 'bed' as const
      };

      vi.mocked(useOptions).mockReturnValue([
        mockOptionsWithBed,
        mockSetOptions,
        mockIsOptionsDefault
      ]);

      const mockPairs: FastqPair[] = [
        {
          name: 'test',
          pair: [new File([''], 'test.fastq'), null],
          pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
          n: 1
        }
      ];

      let onSubmitCallback: ((pairs: FastqPair[]) => void) | undefined;
      vi.mocked(UploadForm).mockImplementation((props) => {
        onSubmitCallback = props.onSubmit;
        return <div data-testid="upload-form">Upload Form</div>;
      });

      vi.mocked(fastq2codfreq).mockReturnValue((async function* () {})() as any);

      render(<NGS2CodFreq />);

      await onSubmitCallback!(mockPairs);

      await waitFor(() => {
        expect(fastq2codfreq).toHaveBeenCalledWith(
          mockPairs,
          undefined,
          expect.objectContaining({
            fastpConfig: mockOptionsWithBed.fastpConfig,
            ivarConfig: mockOptionsWithBed.ivarConfig
          })
        );
      });
    });

    it('does not process when fastqPairs is empty', async () => {
      let onSubmitCallback: ((pairs: FastqPair[]) => void) | undefined;
      vi.mocked(UploadForm).mockImplementation((props) => {
        onSubmitCallback = props.onSubmit;
        return <div data-testid="upload-form">Upload Form</div>;
      });

      render(<NGS2CodFreq />);

      await onSubmitCallback!([]);

      expect(fastq2codfreq).not.toHaveBeenCalled();
    });

    it('passes runners to fastq2codfreq', async () => {
      const mockRunners = [{id: 'runner1'}, {id: 'runner2'}];
      const mockPairs: FastqPair[] = [
        {
          name: 'test',
          pair: [new File([''], 'test.fastq'), null],
          pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
          n: 1
        }
      ];

      let onSubmitCallback: ((pairs: FastqPair[]) => void) | undefined;
      vi.mocked(UploadForm).mockImplementation((props) => {
        onSubmitCallback = props.onSubmit;
        return <div data-testid="upload-form">Upload Form</div>;
      });

      vi.mocked(fastq2codfreq).mockReturnValue((async function* () {})() as any);

      render(<NGS2CodFreq runners={mockRunners} />);

      await onSubmitCallback!(mockPairs);

      await waitFor(() => {
        expect(fastq2codfreq).toHaveBeenCalledWith(
          mockPairs,
          mockRunners,
          expect.any(Object)
        );
      });
    });

    it('calls onTriggerRunner during file processing', async () => {
      const onTriggerRunner = vi.fn();
      const mockPairs: FastqPair[] = [
        {
          name: 'test',
          pair: [new File([''], 'test.fastq'), null],
          pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
          n: 1
        }
      ];

      let onSubmitCallback: ((pairs: FastqPair[]) => void) | undefined;
      vi.mocked(UploadForm).mockImplementation((props) => {
        onSubmitCallback = props.onSubmit;
        return <div data-testid="upload-form">Upload Form</div>;
      });

      vi.mocked(fastq2codfreq).mockReturnValue((async function* () {
        yield {
          step: 'trigger-runner',
          taskKey: 'test-task',
          description: 'Triggering',
          count: 1,
          total: 1
        };
      })() as any);

      render(<NGS2CodFreq onTriggerRunner={onTriggerRunner} />);

      await onSubmitCallback!(mockPairs);

      await waitFor(() => {
        expect(onTriggerRunner).toHaveBeenCalledWith('test-task');
      });
    });

    it('calls onLoad when processing completes', async () => {
      const onLoad = vi.fn();
      const mockCodfreqs = [{data: 'result'}];
      const mockPairs: FastqPair[] = [
        {
          name: 'test',
          pair: [new File([''], 'test.fastq'), null],
          pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
          n: 1
        }
      ];

      let onSubmitCallback: ((pairs: FastqPair[]) => void) | undefined;
      vi.mocked(UploadForm).mockImplementation((props) => {
        onSubmitCallback = props.onSubmit;
        return <div data-testid="upload-form">Upload Form</div>;
      });

      vi.mocked(fastq2codfreq).mockReturnValue((async function* () {
        yield {
          step: 'complete',
          description: 'Done',
          count: 10,
          total: 10,
          loaded: true,
          codfreqs: mockCodfreqs
        };
      })() as any);

      render(<NGS2CodFreq onLoad={onLoad} />);

      await onSubmitCallback!(mockPairs);

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalledWith(mockCodfreqs);
      });
    });

    it('stops processing when onTriggerRunner returns false during submission', async () => {
      const onTriggerRunner = vi.fn().mockReturnValue(false);
      const mockPairs: FastqPair[] = [
        {
          name: 'test',
          pair: [new File([''], 'test.fastq'), null],
          pattern: {delimiter: null, diffOffset: -1, posPairedMarker: -1, reverse: -1},
          n: 1
        }
      ];

      let onSubmitCallback: ((pairs: FastqPair[]) => void) | undefined;
      vi.mocked(UploadForm).mockImplementation((props) => {
        onSubmitCallback = props.onSubmit;
        return <div data-testid="upload-form">Upload Form</div>;
      });

      let yieldCount = 0;
      vi.mocked(fastq2codfreq).mockReturnValue((async function* () {
        yield {
          step: 'trigger-runner',
          taskKey: 'test-task',
          description: 'Triggering',
          count: 1,
          total: 1
        };
        yieldCount++;
        yield {
          step: 'should-not-reach',
          description: 'Should not reach',
          count: 2,
          total: 2
        };
        yieldCount++;
      })() as any);

      render(<NGS2CodFreq onTriggerRunner={onTriggerRunner} />);

      await onSubmitCallback!(mockPairs);

      await waitFor(() => {
        expect(onTriggerRunner).toHaveBeenCalled();
      });

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(yieldCount).toBeLessThanOrEqual(1);
    });
  });

  describe('Results Display', () => {
    it('passes taskKey to results component', async () => {
      const mockProgress = {
        step: 'create-task',
        description: 'Task created',
        count: 1,
        total: 1
      };

      vi.mocked(restoreTask).mockReturnValue((async function* () {
        yield mockProgress;
      })() as any);

      render(<NGS2CodFreq taskKey="my-task-key" />);

      await waitFor(() => {
        expect(NGSResults).toHaveBeenCalledWith(
          expect.objectContaining({
            taskKey: 'my-task-key',
            className: undefined,
            onAnalyze: undefined,
            progressLookup: expect.any(Object)
          }),
          undefined
        );
      });
    });

    it('passes className to results component', async () => {
      const mockProgress = {
        step: 'create-task',
        description: 'Task created',
        count: 1,
        total: 1
      };

      vi.mocked(restoreTask).mockReturnValue((async function* () {
        yield mockProgress;
      })() as any);

      render(<NGS2CodFreq taskKey="test-task" className="custom-class" />);

      await waitFor(() => {
        expect(NGSResults).toHaveBeenCalledWith(
          expect.objectContaining({
            className: 'custom-class',
            taskKey: 'test-task',
            onAnalyze: undefined,
            progressLookup: expect.any(Object)
          }),
          undefined
        );
      });
    });

    it('passes onAnalyze to results component', async () => {
      const onAnalyze = vi.fn();
      const mockProgress = {
        step: 'create-task',
        description: 'Task created',
        count: 1,
        total: 1
      };

      vi.mocked(restoreTask).mockReturnValue((async function* () {
        yield mockProgress;
      })() as any);

      render(<NGS2CodFreq taskKey="test-task" onAnalyze={onAnalyze} />);

      await waitFor(() => {
        expect(NGSResults).toHaveBeenCalledWith(
          expect.objectContaining({
            onAnalyze,
            className: undefined,
            taskKey: 'test-task',
            progressLookup: expect.any(Object)
          }),
          undefined
        );
      });
    });

    it('passes progressLookup to results component', async () => {
      const mockProgress = {
        step: 'create-task',
        description: 'Task created',
        count: 1,
        total: 1
      };

      vi.mocked(restoreTask).mockReturnValue((async function* () {
        yield mockProgress;
      })() as any);

      render(<NGS2CodFreq taskKey="test-task" />);

      await waitFor(() => {
        expect(NGSResults).toHaveBeenCalledWith(
          expect.objectContaining({
            progressLookup: expect.objectContaining({
              'create-task': mockProgress
            }),
            className: undefined,
            taskKey: 'test-task',
            onAnalyze: undefined
          }),
          undefined
        );
      });
    });
  });
});
