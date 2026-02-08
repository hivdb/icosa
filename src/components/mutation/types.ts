/**
 * Type definitions for Mutation component.
 * 
 * Mutation displays individual mutation information with highlighting
 * and optional hover popups.
 */

import type React from 'react';

/**
 * Amino acid read data for a mutation position.
 */
export interface AARead {
  /** Amino acid character */
  aminoAcid: string;
  /** Percentage of reads with this amino acid */
  percent: number;
}

/**
 * Drug resistance mutation drug class information.
 */
export interface DRMDrugClass {
  /** Short drug class name */
  name: string;
  /** Full drug class name */
  fullName: string;
}

/**
 * Configuration for mutation display and highlighting.
 */
export interface MutationConfig {
  /** Highlight unusual mutations */
  highlightUnusualMutation?: boolean;
  /** Highlight drug resistance mutations */
  highlightDRM?: boolean;
  /** Highlight APOBEC mutations */
  highlightApobecMutation?: boolean;
  /** Highlight APOBEC drug resistance mutations */
  highlightApobecDRM?: boolean;
  /** Gene display name mapping */
  geneDisplay: Record<string, string>;
  /** Message templates for mutation popups */
  messages: Record<string, string>;
}

/**
 * Props for Mutation component.
 * 
 * @param as - HTML element type to render as (default: 'li')
 * @param gene - Gene name
 * @param text - Mutation text (e.g., 'M184V')
 * @param isUnusual - Whether mutation is unusual
 * @param isDRM - Whether mutation is a drug resistance mutation
 * @param DRMDrugClass - Drug class information for DRM
 * @param isApobecMutation - Whether mutation is APOBEC-associated
 * @param isApobecDRM - Whether mutation is both APOBEC and DRM
 * @param isUnsequenced - Whether position is unsequenced
 * @param totalReads - Total read coverage at position
 * @param allAAReads - Amino acid read distribution
 * @param config - Display and highlighting configuration
 */
export interface MutationProps {
  /** HTML element type to render as */
  as?: React.ElementType;
  /** Gene name */
  gene: string;
  /** Mutation text */
  text: string;
  /** Is unusual mutation */
  isUnusual?: boolean;
  /** Is drug resistance mutation */
  isDRM?: boolean;
  /** Drug class information */
  DRMDrugClass?: DRMDrugClass;
  /** Is APOBEC-associated mutation */
  isApobecMutation?: boolean;
  /** Is APOBEC drug resistance mutation */
  isApobecDRM?: boolean;
  /** Is unsequenced position */
  isUnsequenced: boolean;
  /** Total read coverage */
  totalReads?: number;
  /** Amino acid read distribution */
  allAAReads?: AARead[];
  /** Display configuration */
  config: MutationConfig;
}
