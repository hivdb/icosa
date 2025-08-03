/**
 * Codon read information at a specific position.
 */
export interface CodonRead {
  /** Codon string (e.g. "AAA"). */
  codon: string;
  /** Number of reads supporting the codon. */
  reads: number;
}

/**
 * Read information for a single genomic position.
 */
export interface PositionRead {
  /** Gene name. */
  gene: string;
  /** 1-based position index. */
  position: number;
  /** Total reads at this position. */
  totalReads: number;
  /** Detailed reads for each observed codon. */
  allCodonReads: CodonRead[];
}

/**
 * Sequence reads input passed to the analysis query.
 */
export interface SequenceReads {
  /** Identifier of the sequence reads. */
  name: string;
  /** Strain name. */
  strain: string;
  /** All reads grouped by position. */
  allReads: PositionRead[];
  /** Minimum prevalence filter. */
  minPrevalence?: number;
  /** Minimum reads required for a position. */
  minPositionReads?: number;
}

