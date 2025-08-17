export interface Region {
  /** Region name. */
  name: string;
  /** Optional region label displayed on the map. */
  label?: string;
  /** Starting position of the region. */
  posStart: number;
  /** Ending position of the region. */
  posEnd: number;
  /** Fill color of the region. */
  fill?: string;
  /** Font color of the label. */
  color?: string;
  /** Vertical offset from the group's baseline. */
  offsetY?: number;
  /** Number of wavy repeats for wavy shapes. */
  wavyRepeats?: number;
  /** Type of shape representing the region. */
  shapeType: 'rect' | 'line' | 'wavy';
  /** Position of the label relative to the shape. */
  labelPosition?: 'above' | 'over' | 'below' | 'after';
}

export type Regions = Region[];

export interface Position {
  /** Position name. */
  name: string;
  /** Optional label for the position. */
  label?: string;
  /** Genomic coordinate. */
  pos: number;
  /** Stroke color of the pointer. */
  stroke?: string;
  /** Stroke width of the pointer. */
  strokeWidth?: number;
  /** Font color of the label. */
  color?: string;
  /** Font weight for the label. */
  fontWeight?: string | number;
  /** Colors of additional arrows to render. */
  arrows?: string[];
  /**
   * Coordinates of the turns that form the pointer path. Each entry is
   * [x, y, direction].
   */
  turns?: [number, number, number][];
}

export interface Domain {
  /** Start position of the domain. */
  posStart: number;
  /** End position of the domain. */
  posEnd: number;
  /** Relative scale ratio of the domain. */
  scaleRatio: number;
}

export interface PositionAxis {
  /** Offset applied to displayed positions. */
  posOffset?: number;
  /** Visible start position. */
  posStart?: number;
  /** Visible end position. */
  posEnd?: number;
  /** Whether to convert positions from nucleotide to amino acid. */
  convertToAA?: boolean;
  /** Number of ticks to show. */
  tickCount?: number;
  /** Round tick positions to nearest value. */
  roundToNearest?: number;
}

export interface PositionGroup {
  /** Group name. */
  name: string;
  /** Optional group label. */
  label?: string;
  /** Positions contained in the group. */
  positions: Position[];
  /** Additional offset introduced during layout. */
  addOffsetY?: number;
}

export interface CoveragePoint {
  /** Genomic coordinate for the coverage point. */
  position: number;
  /** Coverage depth at the position. */
  coverage: number;
}

export interface Coverages {
  /** Height of the coverage area. */
  height: number;
  /** Start position of coverage. */
  posStart: number;
  /** End position of coverage. */
  posEnd: number;
  /** Fill color for coverage area. */
  fill?: string;
  /** Upper limit for coverage values. */
  coverageUpperLimit?: number;
  /** Individual coverage points. */
  coverages: CoveragePoint[];
}

export interface Preset {
  /** Unique name for the preset. */
  name: string;
  /** Display label for the genome map. */
  label: string;
  /** SVG width. */
  width: number;
  /** Minimum SVG height. */
  height: number;
  /** Padding above the map content. */
  paddingTop: number;
  /** Right padding. */
  paddingRight: number;
  /** Left padding. */
  paddingLeft: number;
  /** Domain configurations describing scaling. */
  domains: Domain[];
  /** Whether the position axis should be hidden. */
  hidePositionAxis?: boolean;
  /** Configuration for the position axis. */
  positionAxis?: PositionAxis;
  /** Position groups rendered on the map. */
  positionGroups: PositionGroup[];
  /** Additional extension size for position pointers. */
  positionExtendSize?: number;
  /** Regions rendered across groups. */
  regions: Region[];
  /** Optional coverage layer. */
  coverages?: Coverages;
  /** Optional footnote rendered below the map. */
  footnote?: string;
}

export type MultiScale = {
  (pos: number): number;
  domain(): [number, number];
  domains(): [number, number][];
  range(): [number, number];
  invert(x: number): number | undefined;
};
