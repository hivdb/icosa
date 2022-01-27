const AA_DISPLAYS = {
  '-': 'del',
  '_': 'ins',
  '*': 'stop'
};


function mutations({
  sequenceReadsAnalysis,
  sequenceAnalysis
}) {
  let header = [
    'Sequence Name',
    'Gene',
    'Position',
    'RefAA',
    'MutAA',
    'Mutation'
  ];
  if (sequenceReadsAnalysis) {
    header = [
      ...header,
      'Count',
      'Total',
      'Percent'
    ];
  }
  const tables = [];
  const seqResults = sequenceAnalysis || sequenceReadsAnalysis;
  for (const seqResult of seqResults) {
    const rows = [];
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
      for (let {
        reference,
        AAs,
        position,
        isUnsequenced,
        totalReads,
        allAAReads
      } of geneSeq.mutations) {
        if (isUnsequenced) {
          continue;
        }
        const row = {
          'Sequence Name': seqName,
          'Gene': gene,
          'Position': position,
          'RefAA': reference
        };
        if (allAAReads) {
          for (const {aminoAcid, numReads, percent} of allAAReads) {
            const aaDisplay = AA_DISPLAYS[aminoAcid] || aminoAcid;
            rows.push({
              ...row,
              'MutAA': aaDisplay,
              'Mutation': gene === 'S' ? (
                `${reference}${position}${aaDisplay}`
              ) : (
                `${gene}:${reference}${position}${aaDisplay}`
              ),
              'Count': numReads,
              'Total': totalReads,
              'Percent': percent
            });
          }
        }
        else {
          if (/_/.test(AAs)) {
            AAs = '_';
          }
          for (const aa of AAs) {
            const aaDisplay = AA_DISPLAYS[aa] || aa;
            rows.push({
              ...row,
              'MutAA': aaDisplay,
              'Mutation': gene === 'S' ? (
                `${reference}${position}${aaDisplay}`
              ) : (
                `${gene}:${reference}${position}${aaDisplay}`
              )
            });
          }
        }
      }
    }
    tables.push({
      folder: 'mutation-list',
      tableName: 'MutationList_' + seqName.replace(/[<>:"/\\|?*]/g, '_'),
      header,
      rows
    });
  }
  return tables;
}

export default mutations;
