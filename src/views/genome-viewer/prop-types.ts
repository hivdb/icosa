/**
 * Type definitions for genome viewer annotations and axes.
 */

/** Annotation of a genome region such as a gene or domain. */
export interface Region {
  name: string;
  label?: string;
  posStart: number;
  posEnd: number;
  fill?: string;
  color?: string;
  offsetY?: number;
  shapeType: 'rect' | 'line';
  labelPosition?: 'above' | 'over' | 'below' | 'after';
}

/** List of {@link Region} items. */
export type Regions = Region[];

/** Annotation at a specific position along the genome. */
export interface Position {
  name: string;
  label?: string;
  pos: number;
  stroke?: string;
  color?: string;
  fontWeight?: string;
  arrows?: string[];
}

/** List of {@link Position} annotations. */
export type Positions = Position[];

/** Domain spanning a range of positions with a scale ratio. */
export interface Domain {
  posStart: number;
  posEnd: number;
  scaleRatio: number;
}

/** List of {@link Domain} entries. */
export type Domains = Domain[];

/** Axis configuration for positioning annotations. */
export interface PositionAxis {
  posOffset?: number;
  posStart?: number;
  posEnd?: number;
  convertToAA?: boolean;
  tickCount?: number;
  roundToNearest?: number;
}

/** Group of positions sharing a label. */
export interface PositionGroup {
  name: string;
  label?: string;
  positions: Positions;
}

/** List of {@link PositionGroup} entries. */
export type PositionGroups = PositionGroup[];
