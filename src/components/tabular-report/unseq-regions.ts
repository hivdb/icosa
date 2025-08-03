export interface UnseqRegionsParams {
  /** per-sequence read analysis results */
  sequenceReadsAnalysis?: any[];
  /** per-sequence analysis results */
  sequenceAnalysis?: any[];
}

export interface UnseqRegionTable {
  tableName: string;
  header: string[];
  rows: Record<string, unknown>[];
}

/**
 * Build a table summarising unsequenced genome regions for each sequence.
 *
 * @param params - {@link UnseqRegionsParams} containing sequence analysis data.
 * @returns Array with a single {@link UnseqRegionTable} describing unsequenced regions.
 */
export default function unseqRegions({
  sequenceReadsAnalysis,
  sequenceAnalysis
}: UnseqRegionsParams): UnseqRegionTable[] {
  let header = [
    'Sequence Name',
    'Gene',
    'Position Start',
    'Position End'
  ];
  const rows: Record<string, unknown>[] = [];
  const seqResults = (sequenceAnalysis || sequenceReadsAnalysis) as any[];
  for (const seqResult of seqResults) {
    const {
      inputSequence: {header: seqName1} = {},
      name: seqName2,
      alignedGeneSequences: geneSeqs1,
      allGeneSequenceReads: geneSeqs2
    } = seqResult;
    const seqName = seqName1 || seqName2;
    const geneSeqs = geneSeqs1 || geneSeqs2;
    for (const geneSeq of geneSeqs) {
      const gene = geneSeq.gene.name;
      for (let {posStart, posEnd} of geneSeq.unsequencedRegions.regions) {
        rows.push({
          'Sequence Name': seqName,
          'Gene': gene,
          'Position Start': posStart,
          'Position End': posEnd
        });
      }
    }
  }
  return [{tableName: 'unsequencedRegions', header, rows}];
}
