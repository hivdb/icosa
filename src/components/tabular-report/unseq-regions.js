function unseqRegions({
  sequenceReadsAnalysis,
  sequenceAnalysis
}) {
  let header = [
    'Sequence Name',
    'Gene',
    'Position Start',
    'Position End'
  ];
  const rows = [];
  const seqResults = sequenceAnalysis || sequenceReadsAnalysis;
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

export default unseqRegions;
