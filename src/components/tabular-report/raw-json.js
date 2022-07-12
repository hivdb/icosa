export default function rawJSON({
  allGenes,
  currentVersion,
  currentProgramVersion,
  sequenceAnalysis,
  sequenceReadsAnalysis
}) {
  const jsons = [];
  const seqResults = sequenceAnalysis || sequenceReadsAnalysis;
  for (const seqResult of seqResults) {
    const {
      inputSequence: {header: seqName1} = {},
      name: seqName2
    } = seqResult;
    const seqName = seqName1 || seqName2;
    jsons.push({
      folder: 'raw-json',
      tableName:
        'Raw_' +
        seqName.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200),
      fileExt: '.json',
      mimeType: 'application/json',
      payload: JSON.stringify({
        allGenes,
        currentVersion,
        currentProgramVersion,
        report: seqResult
      }, null, 2)
    });
  }
  return jsons;
}
