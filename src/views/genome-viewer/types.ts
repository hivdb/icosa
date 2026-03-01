/**
 * Type definitions for genome viewer components.
 */

import type {SelectOption} from '../../components/select';
import type {Preset} from '../../components/genome-map/types';

/**
 * Summary information for a genome viewer preset.
 */
export interface PresetSummary {
  name: string;
  label: React.ReactNode;
}

/**
 * Props for the PresetSelection component.
 */
export interface PresetSelectionProps {
  className?: string;
  options: SelectOption[];
  as?: keyof React.JSX.IntrinsicElements | React.ComponentType<any>;
}

/**
 * Props for the GenomeViewer component.
 */
export interface GenomeViewerProps {
  options: SelectOption[];
  preset: Preset;
}

/**
 * Props for the GenomeViewerLoader component.
 */
export interface GenomeViewerLoaderProps {
  presetLoader: () => Promise<Preset & {presets: {name: string; label: React.ReactNode}[]}>;
}

/**
 * Props for the GenomeViewerRoutes component.
 */
export interface GenomeViewerRoutesProps {
  pathPrefix?: string;
  indexLoader: () => Promise<{presets: PresetSummary[]}>;
  makePresetLoader: (name: string) => () => Promise<any>;
  colors?: Record<string, string>;
  className?: string;
}

/**
 * Annotation of a genome region such as a gene or domain.
 */
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

/**
 * List of {@link Region} items.
 */
export type Regions = Region[];

/**
 * Annotation at a specific position along the genome.
 */
export interface Position {
  name: string;
  label?: string;
  pos: number;
  stroke?: string;
  color?: string;
  fontWeight?: string;
  arrows?: string[];
}

/**
 * List of {@link Position} annotations.
 */
export type Positions = Position[];

/**
 * Domain spanning a range of positions with a scale ratio.
 */
export interface Domain {
  posStart: number;
  posEnd: number;
  scaleRatio: number;
}

/**
 * List of {@link Domain} entries.
 */
export type Domains = Domain[];

/**
 * Axis configuration for positioning annotations.
 */
export interface PositionAxis {
  posOffset?: number;
  posStart?: number;
  posEnd?: number;
  convertToAA?: boolean;
  tickCount?: number;
  roundToNearest?: number;
}

/**
 * Group of positions sharing a label.
 */
export interface PositionGroup {
  name: string;
  label?: string;
  positions: Positions;
}

/**
 * List of {@link PositionGroup} entries.
 */
export type PositionGroups = PositionGroup[];
