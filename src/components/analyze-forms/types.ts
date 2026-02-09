/**
 * Type definitions for analyze forms components.
 * 
 * This module provides types for the analyze forms system which allows users
 * to submit mutations, sequences, or sequence reads for analysis.
 */

import type React from 'react';
import type {Match, Router} from 'found';

/**
 * Form submission state returned by onSubmit handlers.
 */
export interface FormSubmitState {
  [key: string]: unknown;
}

/**
 * Query parameters for navigation.
 */
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Props for {@link AnalyzeBaseForm}.
 */
export interface AnalyzeBaseFormProps {
  /** Destination pathname to navigate after successful submission. */
  to: string;
  /** Submit handler returning validation result, state and optional query. */
  onSubmit(
    e: React.SyntheticEvent
  ): Promise<[boolean, FormSubmitState, QueryParams?]>;
  /** Reset handler invoked when user clicks reset. */
  onReset(e: React.SyntheticEvent): void;
  /** Form body or render function receiving saved input. */
  children: React.ReactNode | ((state: FormSubmitState) => React.ReactNode);
  /** Optional CSS class applied to the container. */
  className?: string;
  /** Whether reset button should be disabled. */
  resetDisabled: boolean;
  /** Whether submit button should be disabled. */
  submitDisabled: boolean;
}

/**
 * Props for {@link AnalyzeFormsContainer}.
 */
export interface AnalyzeFormsContainerProps {
  /** Name of the currently active tab. */
  tabName: string;
  /** Optional additional CSS class. */
  className?: string;
  /** Inner content of the container. */
  children?: React.ReactNode;
}

/**
 * Example FASTA file configuration.
 */
export interface ExampleFasta {
  /** URL where the example file can be fetched. */
  url: string;
  /** Display title for the example. */
  title: string;
}

/**
 * State passed to output option renderers.
 */
export interface OutputOptionState {
  [key: string]: unknown;
}

/**
 * Configuration for a single output option in sequence forms.
 */
export interface OutputOptionConfig {
  /** Label displayed for this option. */
  label: React.ReactNode;
  /** Optional sub-options that can be selected. */
  subOptions?: React.ReactNode[];
  /** Default indices of sub-options to select. */
  defaultSubOptions?: number[];
  /** Optional renderer function for custom output. */
  renderer?: (state: OutputOptionState) => React.ReactNode;
  /** Alternative name for subOptions (backward compatibility). */
  children?: React.ReactNode[];
  /** Alternative name for defaultSubOptions (backward compatibility). */
  defaultChildren?: number[];
}

/**
 * Parsed sequence data structure.
 */
export interface Sequence {
  header: string;
  sequence: string;
  [key: string]: unknown;
}

/**
 * Props for {@link SequenceInputForm}.
 */
export interface SequenceInputFormProps {
  /** Optional children elements. */
  children?: React.ReactNode;
  /** Where to place children relative to form inputs. */
  childrenPlacement?: 'top' | 'bottom';
  /** Example FASTA files users can load. */
  exampleFasta?: ExampleFasta[];
  /** Destination path after submission. */
  to?: string;
  /** Available output options. */
  outputOptions?: Record<string, OutputOptionConfig>;
  /** Submit handler receiving sequences. */
  onSubmit?(e: React.SyntheticEvent, sequences: Sequence[]): Promise<[boolean, FormSubmitState, QueryParams?]>;
}

/**
 * Sequence read data structure.
 */
export interface SequenceRead {
  name: string;
  gene?: string;
  [key: string]: unknown;
}

/**
 * Props for {@link SequenceReadsInputForm}.
 */
export interface SequenceReadsInputFormProps {
  children?: React.ReactNode;
  to: string;
  outputOptions?: Record<string, OutputOptionConfig>;
  onSubmit?(e: React.SyntheticEvent, seqReads: SequenceRead[]): Promise<[boolean, FormSubmitState, QueryParams?]>;
  exampleCodonReads?: string[];
}

/**
 * NGS runner configuration.
 */
export interface NGSRunner {
  [key: string]: unknown;
}

/**
 * Tab types supported by analyze forms.
 */
export type AnalyzeTab = 'patterns' | 'sequences' | 'reads';

/**
 * Props for {@link AnalyzeForms}.
 */
export interface AnalyzeFormsProps {
  /** Router match object providing current location. */
  match: Match;
  /** Router instance used for navigation actions. */
  router: Router;
  /** Optional submit handler invoked by individual forms. */
  onSubmit?(...args: unknown[]): Promise<[boolean, FormSubmitState, QueryParams?]>;
  /** Tabs to display. Defaults to patterns, sequences and reads. */
  enableTabs?: AnalyzeTab[];
  /** Base path used when constructing tab links. */
  basePath: string;
  /** Destination path for mutation pattern submission. */
  patternsTo: string;
  /** Destination path for sequence submission. */
  sequencesTo: string;
  /** Destination path for sequence read submission. */
  readsTo?: string;
  /** Configuration for sequence output options. */
  sequencesOutputOptions?: Record<string, OutputOptionConfig>;
  /** Configuration for sequence read output options. */
  seqReadsOutputOptions?: Record<string, OutputOptionConfig>;
  /** Available NGS runners passed to the ngs2codfreq form. */
  ngsRunners?: NGSRunner[];
  /** Optional sidebar element displayed with ngs2codfreq. */
  ngs2codfreqSide?: React.ReactNode;
  /** Children elements placed above all forms. */
  children?: React.ReactNode;
  /** Allow additional arbitrary props. */
  [key: string]: unknown;
}
