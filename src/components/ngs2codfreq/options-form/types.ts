import type { ReactNode } from 'react';

/**
 * Configuration options for fastp trimming tool.
 * @property includeUnmerged - whether to include unmerged reads.
 * @property qualifiedQualityPhred - minimum qualified phred score.
 * @property unqualifiedPercentLimit - maximum percentage of unqualified bases.
 * @property nBaseLimit - maximum number of N bases allowed.
 * @property averageQual - minimum average quality score.
 * @property lengthRequired - minimum read length required.
 * @property lengthLimit - maximum read length allowed.
 * @property adapterSequence - adapter sequence for read1.
 * @property adapterSequenceR2 - adapter sequence for read2.
 * @property disableAdapterTrimming - disable adapter trimming if true.
 * @property disableTrimPolyG - disable poly-G trimming if true.
 * @property disableQualityFiltering - disable quality filtering if true.
 * @property disableLengthFiltering - disable length filtering if true.
 */
export interface FastpConfig {
  includeUnmerged: boolean;
  qualifiedQualityPhred: number;
  unqualifiedPercentLimit: number;
  nBaseLimit: number;
  averageQual: number;
  lengthRequired: number;
  lengthLimit: number;
  adapterSequence: string;
  adapterSequenceR2: string;
  disableAdapterTrimming: boolean;
  disableTrimPolyG: boolean;
  disableQualityFiltering: boolean;
  disableLengthFiltering: boolean;
}

/** Default configuration for fastp. */
export const defaultFastpConfig: FastpConfig = {
  includeUnmerged: true,
  qualifiedQualityPhred: 15,
  unqualifiedPercentLimit: 40,
  nBaseLimit: 5,
  averageQual: 0,
  lengthRequired: 15,
  lengthLimit: 0,
  adapterSequence: 'auto',
  adapterSequenceR2: 'auto',
  disableAdapterTrimming: false,
  disableTrimPolyG: false,
  disableQualityFiltering: false,
  disableLengthFiltering: false
};

/**
 * Primer sequence definition for cutadapt.
 * @property idx - identifier for the primer.
 * @property header - FASTA header for the primer.
 * @property sequence - nucleotide sequence of the primer.
 * @property type - trimming type for the primer ends.
 */
export interface PrimerSeq {
  idx: number;
  header: string;
  sequence: string;
  type: 'three-end' | 'five-end' | 'both-end';
}

/**
 * Configuration for cutadapt tool when primers are provided as sequences.
 */
export interface CutadaptConfig {
  primerSeqs: PrimerSeq[];
  errorRate: number;
  noIndels: boolean;
  times: number;
  minOverlap: number;
}

/** Default configuration for cutadapt. */
export const defaultCutadaptConfig: CutadaptConfig = {
  primerSeqs: [],
  errorRate: 0.1,
  noIndels: true,
  times: 1,
  minOverlap: 3
};

/**
 * Primer location definition used by iVar.
 * @property idx - identifier for the primer location.
 * @property region - genomic region name.
 * @property start - start position (1-based).
 * @property end - end position (1-based).
 * @property name - primer name.
 * @property score - BED score (unused by ivar).
 * @property strand - strand information '+' or '-'.
 */
export interface PrimerBed {
  idx: number;
  region: string;
  start: number;
  end: number;
  name: string;
  score: number;
  strand: '+' | '-';
}

/**
 * Configuration for iVar tool when primers are provided as BED locations.
 */
export interface IvarConfig {
  primerBeds: PrimerBed[];
  minLength: number;
  minQuality: number;
  includeReadsWithNoPrimers: boolean;
}

/** Default configuration for iVar. */
export const defaultIvarConfig: IvarConfig = {
  primerBeds: [],
  minLength: 0,
  minQuality: 0,
  includeReadsWithNoPrimers: true
};

/** Union of all configuration types. */
export interface NGSOptions {
  fastpConfig: FastpConfig;
  cutadaptConfig: CutadaptConfig;
  ivarConfig: IvarConfig;
  saveInBrowser: boolean;
  primerType: 'fasta' | 'bed' | 'off';
}
