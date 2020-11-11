function extendMutationCol(row, colName, geneKey, mutations) {
  row[`Num ${colName}`] = row[`Num ${colName}`] || 0;
  row[colName] = row[colName] || [];
  row[`Num ${colName}`] += mutations.length;
  row[colName] = [
    ...row[colName],
    ...mutations.map(({text}) => `${geneKey}:${text}`)
  ];
}


function joinCols(row, ...cols) {
  for (const col of cols) {
    if (row[col] && row[col].length > 0) {
      row[col] = row[col].join(',');
    }
    else if (col in row) {
      row[col] = 'None';
    }
  }
}


function sequenceSummaries({
  currentProgramVersion,
  sequenceAnalysis,
  config
}) {
  const rows = [];
  const {geneDisplay} = config;
  let header = [
    'Sequence Name',
    'Genes',
    'Pcnt Mix'
  ];
  for (const geneKey in geneDisplay) {
    const gene = geneDisplay[geneKey];
    header.push(`${gene} Start`);
    header.push(`${gene} End`);
  }
  for (const geneKey in geneDisplay) {
    const gene = geneDisplay[geneKey];
    header.push(`Num ${gene} Mutations`);
    header.push(`${gene} Mutations`);
  }
  header = [
    ...header,
    'Num Frame Shifts',
    'Frame Shifts',
    'Num Insertions',
    'Insertions',
    'Num Deletions',
    'Deletions',
    'Num Stop Codons',
    'Stop Codons',
    'Num BDHVN',
    'BDHVN',
    'Num Unsequenced',
    'Unsequenced',
    'Num Unusuals',
    'Unusuals'
  ];
  for (const seqResult of sequenceAnalysis) {
    const {
      inputSequence: {header: seqName},
      availableGenes: genes,
      alignedGeneSequences: geneSeqs,
      mixturePcnt
    } = seqResult;
    let row = {
      'Sequence Name': seqName,
      'Genes': genes.map(({name}) => geneDisplay[name]).join(','),
      'Pcnt Mix': mixturePcnt.toFixed(2),
    };
    const geneSeqLookup = geneSeqs.reduce(
      (acc, geneSeq) => {
        acc[geneSeq.gene.name] = geneSeq;
        return acc;
      }, {}
    );
    for (const geneKey in geneDisplay) {
      const gene = geneDisplay[geneKey];
      const geneSeq = geneSeqLookup[geneKey];
      if (!geneSeq) {
        continue;
      }
      const {
        firstAA,
        lastAA,
        mutations,
        frameShifts
      } = geneSeq;
      row[`${gene} Start`] = firstAA;
      row[`${gene} End`] = lastAA;
      row[`Num ${gene} Mutations`] = mutations.length;
      row[`${gene} Mutations`] = (
        mutations.map(({text}) => text).join(',') || 'None'
      );
      row['Num Frame Shifts'] = row['Num Frame Shifts'] || 0;
      row['Frame Shifts'] = row['Frame Shifts'] || [];
      row['Num Frame Shifts'] += frameShifts.length;
      row['Frame Shifts'] = [
        ...row['Frame Shifts'],
        ...frameShifts.map(({text}) => text)
      ];
      const insertions = mutations.filter(m => m.isInsertion);
      extendMutationCol(row, 'Insertions', geneKey, insertions);
      const deletions = mutations.filter(m => m.isDeletion);
      extendMutationCol(row, 'Deletions', geneKey, deletions);
      const stops = mutations.filter(m => m.hasStop);
      extendMutationCol(row, 'Stop Codons', geneKey, stops);
      const bdhvn = mutations.filter(m => m.isAmbiguous);
      extendMutationCol(row, 'BDHVN', geneKey, bdhvn);
      const unseqs = mutations.filter(m => m.isUnsequenced);
      extendMutationCol(row, 'Unsequenced', geneKey, unseqs);
      const unusuals = mutations.filter(m => m.isUnusual);
      extendMutationCol(row, 'Unusuals', geneKey, unusuals);
    }
    joinCols(
      row, 'Frame Shifts', 'Insertions',
      'Deletions', 'Stop Codons', 'BDHVN',
      'Unsequenced', 'Unusuals'
    );
    rows.push(row);
  }
  return [{tableName: 'sequenceSummaries', header, rows}];
}

export default sequenceSummaries;
