/**
 * Join array values in a row into comma-separated strings.
 */
function joinCols(row: Record<string, any>): void {
  for (const col of Object.keys(row)) {
    if (row[col] instanceof Array) {
      if (row[col].length > 0) {
        row[col] = row[col].join(',');
      }
      else if (col in row) {
        row[col] = 'None';
      }
    }
  }
}


interface GetMutArgs {
  geneSeqs: any[];
  geneFilter?: (name: string) => boolean;
  mutFilter?: (m: any) => boolean;
  mutWithGene?: boolean;
}

/** Extract mutation texts from gene sequences. */
function getMutations({
  geneSeqs,
  geneFilter,
  mutFilter,
  mutWithGene = true
}: GetMutArgs): string[] {
  let results: any[] = [];
  for (const geneSeq of geneSeqs.filter(
    ({gene: {name}}) => geneFilter ? geneFilter(name) : true
  )) {
    const gene = geneSeq.gene.name.replace(/^_/, '');
    const mutations = geneSeq.mutations
      .filter(
        (m: any) => !m.isUnsequenced && (mutFilter ? mutFilter(m) : true)
      )
      .map((mut: any) => ({...mut, gene}));
    results = [...results, ...mutations];
  }
  return results.map(
    ({gene, text}) => (
      mutWithGene ? `${gene}:${text}` : text
    )
  );
}


function getPermanentLink(seqName: string, geneSeqs: any[], patternsTo: string, geneFilter: any): string {
  const mutText = getMutations({geneSeqs, geneFilter});
  const link = new URL(patternsTo, window.location.href);
  const query = new URLSearchParams();
  query.set('name', seqName);
  query.set('mutations', mutText as any);
  link.search = query.toString();
  return link.toString();
}


interface SequenceSummaryArgs {
  sequenceAnalysis: any[];
  config: any;
  patternsTo: string;
}

/** Build sequence summary tables for tabular reports. */
async function sequenceSummary({
  sequenceAnalysis,
  config,
  patternsTo
}: SequenceSummaryArgs): Promise<any[]> {
  const rows = [];
  const {allGenes, geneDisplay} = config;
  let header = [
    'Sequence Name',
    'Genes',
    ...allGenes.reduce(
      (acc: string[], gene: string) => {
        acc.push(`${gene} Mutations`, `# ${gene} Mutations`);
        return acc;
      },
      [] as string[]
    ),
    'Permanent Link'
  ];

  for (const seqResult of sequenceAnalysis) {
    const {
      inputSequence: {header: seqName},
      availableGenes: genes,
      alignedGeneSequences: geneSeqs
    } = seqResult;
    let row = {
      'Sequence Name': seqName,
      'Genes': genes.map(({name}: any) => geneDisplay[name] || name),
        ...allGenes.reduce(
          (acc: Record<string, any>, gene: string) => {
            acc[`${gene} Mutations`] = getMutations({
              geneSeqs,
              geneFilter: g => g === gene,
              mutWithGene: false
            });
            acc[`# ${gene} Mutations`] = `${geneSeqs.find(
              ({gene: {name}}: any) => name === gene
            ).mutationCount}`;
            return acc;
          },
          {}
        ),
      'Permanent Link': getPermanentLink(
        seqName,
        geneSeqs,
        patternsTo,
        () => true
      )
    };
    joinCols(row);
    rows.push(row);
  }
  return [{tableName: 'sequenceSummaries', header, rows}];
}

export default sequenceSummary;
