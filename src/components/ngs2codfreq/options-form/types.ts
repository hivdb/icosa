/**
 * Configuration options for the `fastp` pre-processing tool.
 * @property includeUnmerged - Include unmerged reads in output.
 * @property qualifiedQualityPhred - Minimum PHRED score considered qualified.
 * @property unqualifiedPercentLimit - Maximum percentage of unqualified bases.
 * @property nBaseLimit - Maximum number of ambiguous bases allowed.
 * @property averageQual - Minimum average quality score of reads.
 * @property lengthRequired - Minimum read length required.
 * @property lengthLimit - Maximum read length allowed.
 * @property adapterSequence - Adapter sequence for read 1.
 * @property adapterSequenceR2 - Adapter sequence for read 2.
 * @property disableAdapterTrimming - Disable adapter trimming step.
 * @property disableTrimPolyG - Disable trimming of poly-G tails.
 * @property disableQualityFiltering - Disable quality filtering.
 * @property disableLengthFiltering - Disable length based filtering.
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

/**
 * Default configuration for {@link FastpConfig}.
 */
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
 * Primer sequence used by the `cutadapt` tool.
 * @property idx - Unique index of the sequence.
 * @property header - FASTA header for the primer.
 * @property sequence - Nucleotide sequence of the primer.
 * @property type - Orientation of the primer.
 */
export interface PrimerSeq {
  idx: number;
  header: string;
  sequence: string;
  type: 'three-end' | 'five-end' | 'both-end';
}

/**
 * Configuration options for the `cutadapt` tool.
 */
export interface CutadaptConfig {
  primerSeqs: PrimerSeq[];
  errorRate: number;
  noIndels: boolean;
  times: number;
  minOverlap: number;
}

/** Default configuration for {@link CutadaptConfig}. */
export const defaultCutadaptConfig: CutadaptConfig = {
  primerSeqs: [],
  errorRate: 0.1,
  noIndels: true,
  times: 1,
  minOverlap: 3
};

/**
 * Primer definition used by the `ivar` tool.
 */
export interface PrimerBed {
  idx: number;
  region: string; // not used by ivar
  start: number;
  end: number;
  name: string;
  score: number; // not used by ivar
  strand: '+' | '-';
}

/**
 * Configuration options for the `ivar` tool.
 */
export interface IvarConfig {
  primerBeds: PrimerBed[];
  minLength: number;
  minQuality: number;
  includeReadsWithNoPrimers: boolean;
}

/** Default configuration for {@link IvarConfig}. */
export const defaultIvarConfig: IvarConfig = {
  primerBeds: [],
  minLength: 0, // ivar should only perform primer trimming
  minQuality: 0,
  includeReadsWithNoPrimers: true
};
