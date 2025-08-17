interface MutationCommentInput {
  sequenceReadsAnalysis?: any[];
  sequenceAnalysis?: any[];
}

/**
 * Generate tables of mutation comments.
 *
 * @param param0 - Object containing analysis results.
 * @returns Array of table data objects.
 */
export default function mutationComments({
  sequenceReadsAnalysis,
  sequenceAnalysis
}: MutationCommentInput) {
  const header = [
    'Sequence Name',
    'Mutation',
    'Comment',
    'Version'
  ];
  const tables: any[] = [];
  const seqResults = sequenceAnalysis || sequenceReadsAnalysis || [];
  for (const seqResult of seqResults) {
    const {
      inputSequence: {header: seqName1} = {},
      name: seqName2,
      mutationComments
    } = seqResult;
    const seqName = seqName1 || seqName2;
    const rows: any[] = [];
    for (const {triggeredMutations, version, comment} of mutationComments) {
      const muts = triggeredMutations.map(({
        gene: {name}, text
      }: any) => `${name.replace(/^_/, '')}:${text}`);
      rows.push({
        'Sequence Name': seqName,
        'Mutation': muts.join(','),
        'Comment': comment,
        'Version': version
      });
    }
    tables.push({
      folder: 'mutation-comments',
      tableName:
        'MutComments_' +
        seqName.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200),
      header,
      rows
    });
  }
  return tables;
}
