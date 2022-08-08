async function algorithmComparison({
  sequenceReadsAnalysis,
  sequenceAnalysis
}) {

  const header = [
    'Sequence Name',
    'Drug Class',
    'Drug Name'
  ];
  const algorithms = new Set();

  const rowMap = {};

  for (const seqResult of sequenceAnalysis || sequenceReadsAnalysis) {
    const {
      name: seqName1,
      inputSequence: {header: seqName2} = {},
      algorithmComparison = []
    } = seqResult;
    const seqName = seqName1 || seqName2;
    for (const {drugClass, drugScores} of algorithmComparison) {
      for (const {drug, algorithm, SIR} of drugScores) {
        const rowKey = `${seqName}${drug.name}`;
        rowMap[rowKey] = rowMap[rowKey] || {
          'Sequence Name': seqName,
          'Drug Class': drugClass.name,
          'Drug Name': drug.displayAbbr
        };
        rowMap[rowKey][`${algorithm} Level`] = SIR;
        algorithms.add(`${algorithm} Level`);
      }
    }
  }

  return [{
    tableName: 'algorithmComparison',
    header: [...header, ...Array.from(algorithms)],
    rows: Object.values(rowMap),
    missing: '-'
  }];
}

export default algorithmComparison;
