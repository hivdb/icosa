function mutationComments({
  sequenceAnalysis,
  config
}) {
  const rows = [];
  const {geneDisplay} = config;
  let header = [
    'Sequence Name',
    'Gene',
    'Mutation',
    'Comment',
    'Comment Type'
  ];
  for (const seqResult of sequenceAnalysis) {
    const {
      inputSequence: {header: seqName},
      drugResistance
    } = seqResult;
    for (const dr of drugResistance) {
      const geneKey = dr.gene.name;
      const gene = geneDisplay[geneKey];
      for (const {commentType, comments} of dr.commentsByTypes) {
        for (const comment of comments) {
          rows.push({
            'Sequence Name': seqName,
            'Gene': gene,
            'Mutation': comment.boundMutation.text,
            'Comment': comment.text,
            'Comment Type': commentType
          });
        }
      }
    }
  }
  return [{tableName: 'mutationComments', header, rows}];
}

export default mutationComments;
