export interface PrettyAlignmentsParams {
  /** collection of gene definitions */
  allGenes: any[];
  /** per-sequence analysis results */
  sequenceAnalysis?: any[];
  /** per-sequence read analysis results */
  sequenceReadsAnalysis?: any[];
  /** configuration object containing gene display names */
  config: { geneDisplay: Record<string, string> };
}

export interface PrettyAlignmentTable {
  folder: string;
  tableName: string;
  header: string[];
  rows: Record<string, unknown>[];
  missing: string;
}

/**
 * Generate "pretty" amino-acid alignment tables for each gene.
 *
 * @param params - {@link PrettyAlignmentsParams} including analysis results and gene metadata.
 * @returns Array of {@link PrettyAlignmentTable} objects describing alignments.
 */
export default function prettyAlignments({
  allGenes,
  sequenceAnalysis,
  sequenceReadsAnalysis,
  config
}: PrettyAlignmentsParams): PrettyAlignmentTable[] {
  const {geneDisplay} = config;
  const tables: PrettyAlignmentTable[] = [];
  for (const geneObj of allGenes) {
    const {
      name: geneKey,
      refSequence,
      length: geneSize
    } = geneObj;
    const refAAs = Array.from(refSequence);
    const header = [
      'Sequence Name',
      ...refAAs.map((_, pos0) => `${pos0 + 1}`)
    ];
    const rows: Record<string, string>[] = [
      {
        'Sequence Name': 'Ref Sequence',
        ...refAAs.reduce((acc, aa, pos0) => {
          acc[`${pos0 + 1}`] = aa;
          return acc;
        }, {})
      }
    ];
    const seqResults = (sequenceAnalysis || sequenceReadsAnalysis) as any[];
    for (const seqResult of seqResults) {
      const seqName = seqResult.name || seqResult.inputSequence.header;
      const row: Record<string, string> = {
        'Sequence Name': seqName
      };
      const geneSeq = (
        seqResult.alignedGeneSequences ||
        seqResult.allGeneSequenceReads
      ).find(
        ({gene: {name}}) => name === geneKey
      );
      if (geneSeq) {
        const {mutations, unsequencedRegions: unseqs} = geneSeq;
        for (const {posStart, posEnd} of unseqs.regions) {
          for (let pos = posStart; pos <= posEnd; pos ++) {
            row[`${pos}`] = '.';
          }
        }
        for (const mut of mutations) {
          let {position, displayAAs, isUnsequenced} = mut;
          if (isUnsequenced) {
            continue;
          }
          if (displayAAs.includes('-')) {
            displayAAs = (
              [displayAAs.replace('-', ''), 'del']
                .filter(n => n)
                .join('/')
            );
          }
          row[`${position}`] = displayAAs;
        }
      }
      else {
        for (let pos0 = 0; pos0 < geneSize; pos0 ++) {
          row[`${pos0 + 1}`] = '.';
        }
      }
      rows.push(row);
    }
    tables.push({
      folder: 'PrettyAA',
      tableName: `PrettyAA_${geneDisplay[geneKey] || geneKey}`,
      header,
      rows,
      missing: '-'
    });
  }
  return tables;
}
