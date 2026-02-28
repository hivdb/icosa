import type React from 'react';
import type {FastqPair} from '../types';

/**
 * Props for the PreviewFiles component.
 */
export interface PreviewFilesProps {
  /** Current FASTQ pairs to display */
  fastqPairs: FastqPair[];
  /** Callback invoked when the pairs change */
  onChange: (pairs: FastqPair[]) => void;
  /** Optional BEM class suffix for styling */
  className?: string;
}

/**
 * Props for a single FASTQ file item within a pair.
 */
export interface FASTQItemProps {
  /** The file represented by this item */
  file: File;
  /** Index of the FASTQ pair in the list */
  index: number;
  /** Optional BEM class suffix */
  className?: string;
  /** Callback when drag begins */
  onDragStart: (file: File, e: React.DragEvent<HTMLLIElement>) => void;
  /** Callback for drag over events */
  onDrag: (e: React.DragEvent<HTMLElement>) => void;
  /** Callback when dragging ends */
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  /** Callback to remove the file */
  onRemove: (args: {index: number; fileName: string}) => void;
  /** Whether dragging is enabled */
  draggable?: boolean;
}

/**
 * Props for a FASTQ pair item (one or two files).
 */
export interface FASTQPairItemProps {
  /** Pair name */
  name: string;
  /** The two files comprising the pair */
  pair: (File | null)[];
  /** Number of files in the pair */
  n: number;
  /** Position of the pair in the list */
  index: number;
  /** Optional BEM class suffix */
  className?: string;
  /** Handler for beginning a drag on a file */
  onDragStart: (file: File, e: React.DragEvent<HTMLLIElement>) => void;
  /** Handler for drag movements */
  onDrag: (e: React.DragEvent<HTMLElement>) => void;
  /** Handler for drag completion */
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  /** File currently being dragged */
  curDragFile: File | null;
  /** Callback to split the pair */
  onSplit: (idx: number) => void;
  /** Callback when a file is moved into this pair */
  onMove: (args: {src: {index: number; fileName: string}; target: {index: number}}) => void;
  /** Callback when pair name changes */
  onNameChange: (name: string, index: number) => void;
  /** Callback to remove a file */
  onRemove: (args: {index: number; fileName: string}) => void;
  /** Whether drag operations are enabled */
  draggable?: boolean;
}

/**
 * Props for the DropPlaceholder component.
 */
export interface DropPlaceholderProps {
  /** Files that can be dropped */
  allowFiles?: File[];
  /** Files that are currently blocked from dropping */
  blockFiles?: (File | null)[];
  /** Callback when a file is dropped */
  onMove: (payload: {index: number; fileName: string}) => void;
  /** File currently being dragged */
  curDragFile: File | null;
  /** Optional BEM class name suffix */
  className?: string;
}
