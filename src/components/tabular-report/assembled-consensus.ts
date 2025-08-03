export interface SequenceReadsResult {
  /** name of the sequence sample */
  name: string;
  /** consensus sequence allowing ambiguous nucleotides */
  assembledConsensus: string;
  /** consensus sequence containing only unambiguous bases */
  assembledUnambiguousConsensus: string;
  /** maximum mixture rate applied when calling consensus */
  maxMixtureRate: number;
  /** minimum prevalence threshold for reporting a base */
  minPrevalence: number;
  /** minimum number of reads covering a position */
  minPositionReads: number;
}

export interface TabularReportFile {
  /** logical name of the report table */
  tableName: string;
  /** file extension to use for the download */
  fileExt: string;
  /** MIME type of the generated file */
  mimeType: string;
  /** textual payload of the file */
  payload: string;
}

export interface AssembledConsensusParams {
  /** collection of sequence read analyses to transform */
  sequenceReadsAnalysis: SequenceReadsResult[];
}

/**
 * Convert read-based consensus information into FASTA formatted text files.
 *
 * @param params - {@link AssembledConsensusParams} describing the analyses to export.
 * @returns Array of {@link TabularReportFile} objects for ambiguous and unambiguous consensus sequences.
 */
export default function assembledConsensus({
  sequenceReadsAnalysis
}: AssembledConsensusParams): TabularReportFile[] {
  const fasta: string[] = [];
  const unambiFasta: string[] = [];
  for (const seqResult of sequenceReadsAnalysis) {
    const {
      name,
      assembledConsensus: seq,
      assembledUnambiguousConsensus: unambiSeq,
      maxMixtureRate,
      minPrevalence,
      minPositionReads
    } = seqResult;
    fasta.push(
      `>${name} posreads: ${minPositionReads}; cutoff: ${minPrevalence}; mixrate: ${maxMixtureRate}`
    );
    fasta.push(seq);
    unambiFasta.push(
      `>${name} unambiguous NA only; posreads: ${minPositionReads}`
    );
    unambiFasta.push(unambiSeq);
  }
  return [
    {
      tableName: 'consensusSequences-AmbiguousNA',
      fileExt: '.fas',
      mimeType: 'application/fasta',
      payload: fasta.join('\n')
    },
    {
      tableName: 'consensusSequences-UnambiguousNA',
      fileExt: '.fas',
      mimeType: 'application/fasta',
      payload: unambiFasta.join('\n')
    }
  ];
}
