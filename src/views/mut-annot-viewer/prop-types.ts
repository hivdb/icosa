import PropTypes from 'prop-types';

/**
 * Shared interfaces for mutation annotation viewer components.
 *
 * These interfaces replace the original React PropTypes definitions
 * to leverage static typing while still exporting PropTypes for
 * legacy JavaScript modules.
 */

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

// Legacy PropTypes exports for JavaScript components still using them.
export const annotShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  level: PropTypes.oneOf(['position', 'aminoAcid']).isRequired,
  hideCitations: PropTypes.bool,
  colorRules: PropTypes.arrayOf(PropTypes.string.isRequired)
});

export const citationShape = PropTypes.shape({
  citationId: PropTypes.number.isRequired,
  sectionId: PropTypes.number.isRequired,
  author: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  doi: PropTypes.string,
  section: PropTypes.string.isRequired
});

export const posShape = PropTypes.shape({
  position: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string,
      description: PropTypes.string,
      aminoAcids: PropTypes.arrayOf(PropTypes.string.isRequired),
      citationIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
    }).isRequired
  ).isRequired
});

export const seqViewerSizeType = PropTypes.oneOf(['large', 'middle', 'small']);

export const annotStyleType = PropTypes.oneOf([
  'colorBox',
  'circleInBox',
  'underscore',
  'aminoAcids',
  'hide'
]);

export const annotCategoryShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  display: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.bool.isRequired
  ]),
  dropdown: PropTypes.bool,
  checkbox: PropTypes.bool,
  multiSelect: PropTypes.bool,
  defaultAnnot: PropTypes.string,
  defaultAnnots: PropTypes.arrayOf(PropTypes.string.isRequired),
  annotStyle: annotStyleType.isRequired,
  color: PropTypes.string
});

export const versionType = PropTypes.oneOf(['20200924115632']);

export const fragmentOptionShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  seqFragment: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
});

export const curAnnotNamesArray = PropTypes.arrayOf(PropTypes.string.isRequired);

export const curAnnotNameLookupShape = PropTypes.objectOf(curAnnotNamesArray.isRequired);
