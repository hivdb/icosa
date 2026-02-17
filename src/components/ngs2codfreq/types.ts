/**
 * Type definitions for the NGS2CodFreq component and related utilities.
 */

/**
 * Description of a filename pattern used to detect pairing.
 *
 * This is a discriminated union:
 * - Single-end reads: reverse === -1, delimiter is null
 * - Paired reads: reverse === 0 or 1, delimiter is a string
 */
export type PairPattern =
  | {
      delimiter: null;
      diffOffset: -1;
      posPairedMarker: -1;
      reverse: -1;
    }
  | {
      delimiter: string;
      diffOffset: number;
      posPairedMarker: number;
      reverse: 0 | 1;
    };

/**
 * A FASTQ pair entry. `pair` contains the two files; one may be `null` for
 * single-end reads. `n` indicates how many files are present (1 or 2).
 */
export interface FastqPair {
  name: string;
  pair: [File | null, File | null];
  pattern: PairPattern;
  n: number;
}

/**
 * Arguments passed to the updateProgress function.
 */
export interface UpdateProgressArgs {
  progress: ProgressPayload;
  progressLookup: Record<string, ProgressPayload>;
  forceUpdate: () => void;
  onTriggerRunner?: (taskKey: string) => boolean | void;
  onLoad?: (codfreqs: unknown[]) => void;
}

/**
 * Progress payload from the worker.
 */
export interface ProgressPayload {
  step: string;
  taskKey?: string;
  loaded?: boolean;
  codfreqs?: unknown[];
  description: string;
  count: number;
  total: number;
}

/**
 * Props for the NGS2CodFreq main component.
 */
export interface NGS2CodFreqProps {
  showOptionsForm?: boolean;
  taskKey?: string;
  onTriggerRunner?: (taskKey: string) => boolean | void;
  onLoad?: (codfreqs: unknown[]) => void;
  onAnalyze?: (codfreqs: unknown[]) => void;
  className?: string;
  runners?: unknown[];
}

/**
 * Props for the NGSResults component.
 */
export interface NGSResultsProps {
  taskKey?: string;
  progressLookup: Record<string, ProgressPayload>;
  className?: string;
  onAnalyze?: (codfreqs: unknown[]) => void;
}

/**
 * Props for the NGSUploadForm component.
 */
export interface NGSUploadFormProps {
  isOptionsDefault: boolean;
  showOptionsForm: boolean;
  className?: string;
  onSubmit?: (pairs: FastqPair[]) => void;
}
