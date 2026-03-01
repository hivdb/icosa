/**
 * Type definitions for mutation viewer components.
 */

import type {Preset} from '../../genome-map/types';

/**
 * Represents an unsequenced region in a gene sequence.
 */
export interface UnsequencedRegion {
  posStart: number;
  posEnd: number;
}

/**
 * Gene sequence data with optional unsequenced regions.
 */
export interface GeneSeq {
  gene: {
    name: string;
  };
  unsequencedRegions?: {
    regions: UnsequencedRegion[];
  };
}

/**
 * Coverage data for a specific position in a gene.
 */
export interface Coverage {
  gene: string;
  position: number;
  coverage: number;
}

/**
 * Gene definition with position ranges.
 */
export interface GeneDef {
  gene: string;
  range: [number, number];
  rangeByStrain?: Record<string, [number, number]>;
}

/**
 * Region presets configuration.
 */
export interface RegionPresets {
  presets: PresetConfig[];
  genes: GeneDef[];
}

/**
 * Configuration for a single preset.
 */
export interface PresetConfig {
  name: string;
  label: string;
  strainOnly?: string[];
  highlightGenes?: string[];
  preset: Omit<Preset, 'name' | 'label' | 'height' | 'positionGroups' | 'coverages'> & {
    minHeight: number;
    regions: Array<{posStart: number; posEnd: number}>;
  };
}

/**
 * Extended preset with coverage information.
 */
export interface ExtendedPreset extends Preset {
  hasCoverage: boolean;
}

/**
 * Props for the MutationViewer component.
 */
export interface MutationViewerProps {
  title?: string;
  strain?: string;
  output?: string;
  children?: React.ReactNode;
  defaultView?: 'collapse' | 'expansion';
  hideViewToggler?: boolean;
  viewCheckboxLabel?: string;
  noUnseqRegions?: boolean;
  regionPresets: RegionPresets;
  highlightUnusualMutation?: boolean;
  highlightDRM?: boolean;
  defaultPresetIndex?: number;
  allGeneSeqs: GeneSeq[];
  coverages?: Coverage[];
  coverageUpperLimit?: number;
}

/**
 * Props for the MutationViewerLoader component (subset of MutationViewerProps).
 */
export type MutationViewerLoaderProps = Omit<
  MutationViewerProps,
  'regionPresets' | 'hideViewToggler' | 'highlightUnusualMutation' | 'highlightDRM'
>;
