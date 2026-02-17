/**
 * Type definitions for the mutations-input component and its subcomponents.
 *
 * This file centralizes all TypeScript interfaces used across the mutations-input
 * component family to ensure consistency and easier maintenance.
 */

import type { SelectOption } from '../select';

/** Interface describing a prefill option entry */
export interface PrefillOption {
  /** Name displayed for the prefill */
  name: string;
  /** Mutations associated with the option */
  mutations: string[];
  /** Optional extra class name for styling */
  className?: string;
}

/** Shape describing a mutation error entry */
export interface MutationError {
  /** Original mutation text */
  text: string;
  /** List of validation error messages */
  errors: string[];
}

/** Mutation suggestion entry with position and amino acids */
export interface MutationSuggestion {
  /** Gene name */
  gene: string;
  /** Array of [position, amino acids] tuples */
  mutations: Array<[number, Iterable<string>]>;
}

/**
 * Tuple representing a processed mutation option with position, amino acids,
 * and formatted select options for the dropdown.
 *
 * Used internally by MutationSuggestOptions to cache computed options.
 */
export type MutationOptionTuple = [
  /** Position number in the gene sequence */
  position: number,
  /** Iterable of amino acid characters at this position */
  aminoAcids: Iterable<string>,
  /** Formatted options for the Select dropdown */
  options: SelectOption[]
];

/** Configuration object for mutations-input components */
export interface MutationsConfig {
  /** When true, gene input is separated from mutation input */
  mutationSplitGeneInput?: boolean;
  /** Suggested mutations grouped by gene */
  mutationSuggestions?: MutationSuggestion[];
  /** Mapping of gene names to reference sequence strings */
  geneReferences: Record<string, string>;
  /** Mapping of gene names to display names */
  geneDisplay: Record<string, string>;
  /** Mapping of gene synonyms to canonical names */
  geneSynonyms: Record<string, string>;
  /** Internationalized messages used by nested components */
  messages: Record<string, string>;
  /** Optional predefined mutation sets */
  mutationPrefills?: PrefillOption[];
  /** Allow position-only inputs (without amino acid changes) */
  allowPositions?: boolean;
  /** Default gene when gene prefix is omitted */
  mutationDefaultGene?: string;
  /** Allow additional unknown properties */
  [key: string]: unknown;
}

/** Payload passed through onChange callbacks */
export interface MutationsChangePayload {
  /** Updated list of mutation strings */
  mutations: string[];
  /** Optional prefill name when selected */
  name?: string | null;
  /** Allow additional properties from parent components */
  [key: string]: unknown;
}
