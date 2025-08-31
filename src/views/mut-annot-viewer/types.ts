/** Annotation definition describing a selectable annotation option. */
export interface Annotation {
  /** Unique annotation name */
  name: string;
  /** Optional human friendly label */
  label?: string;
  /** Level at which annotation applies */
  level: 'position' | 'aminoAcid';
  /** Whether to hide citation list */
  hideCitations?: boolean;
  /** Optional color rules applied when rendering */
  colorRules?: string[];
  /** Associated category name */
  category?: string;
}

/** Citation information for a particular mutation annotation. */
export interface Citation {
  citationId: number;
  sectionId: number;
  author: string;
  year: number;
  doi?: string;
  section: string;
}

/** Individual annotation attached to a position. */
export interface PosAnnotation {
  name: string;
  value?: string;
  description?: string;
  aminoAcids?: string[];
  citationIds: string[];
}

/** Position information including all annotations for that position. */
export interface Position {
  position: number;
  annotations: PosAnnotation[];
}

/** Available sizes for the sequence viewer component. */
export type SeqViewerSize = 'large' | 'middle' | 'small';

/** Styles supported by annotation categories. */
export type AnnotStyle =
  | 'colorBox'
  | 'circleInBox'
  | 'underscore'
  | 'aminoAcids'
  | 'hide';

/** Configuration of an annotation category. */
export interface AnnotCategory {
  name: string;
  display?: string | boolean;
  dropdown?: boolean;
  checkbox?: boolean;
  multiSelect?: boolean;
  defaultAnnot?: string;
  defaultAnnots?: string[];
  annotStyle: AnnotStyle;
  color?: string;
}

/** Version identifier for data payload. */
export type Version = '20200924115632';

/** Fragment option representing a selectable region. */
export interface FragmentOption {
  name: string;
  /** Tuple representing inclusive [start, end] positions */
  seqFragment: [number, number];
}

/** Array of annotation names used for a category. */
export type CurAnnotNamesArray = string[];

/** Lookup mapping category name to selected annotation names. */
export type CurAnnotNameLookup = Record<string, string[]>;

