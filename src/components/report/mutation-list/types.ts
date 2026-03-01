/**
 * Type definitions for mutation-list component.
 */

import type {MutationConfig} from '../../mutation/types';

/**
 * Application configuration that extends MutationConfig with additional fields.
 */
export interface AppConfig extends MutationConfig {
  [key: string]: unknown;
}

/**
 * Properties for {@link MutationList} component.
 */
export interface MutationListProps {
  /**
   * Mutations grouped by gene for pattern analysis.
   */
  allGeneMutations?: GeneSequence[];
  /**
   * Gene sequence reads for seqReads analysis.
   */
  allGeneSequenceReads?: GeneSequence[];
  /**
   * Aligned gene sequences for sequence analysis.
   */
  alignedGeneSequences?: GeneSequence[];
}

/**
 * Properties for {@link GeneMutationList} component.
 */
export interface GeneMutationListProps {
  /**
   * Global configuration object.
   */
  config: AppConfig;
  /**
   * Mapping from gene name to display name.
   */
  geneDisplay: Record<string, string>;
  /**
   * Gene information containing a name field.
   */
  gene: Gene;
  /**
   * List of mutation objects for the gene.
   */
  mutations?: Mutation[];
}

/**
 * Represents a gene with its name.
 */
export interface Gene {
  name: string;
}

/**
 * Represents a gene sequence with mutations.
 */
export interface GeneSequence {
  gene: Gene;
  mutations?: Mutation[];
}

/**
 * Represents a mutation.
 */
export interface Mutation {
  /**
   * Amino acids.
   */
  AAs: string;
  /**
   * Mutation text.
   */
  text: string;
  /**
   * Reference amino acid.
   */
  reference: string;
  /**
   * Position in the sequence.
   */
  position: number;
  /**
   * Whether the mutation is unsequenced.
   */
  isUnsequenced: boolean;
  [key: string]: unknown;
}
