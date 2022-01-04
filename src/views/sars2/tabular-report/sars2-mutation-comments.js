import shortenMutList from '../../../utils/shorten-mutation-list';


function mutationComments({
  sequenceReadsAnalysis,
  sequenceAnalysis,
  config
}) {
  const {geneDisplay} = config;
  let header = [
    'Sequence Name',
    'Mutation',
    'Comment',
    'Version'
  ];
  const tables = [];
  const seqResults = sequenceAnalysis || sequenceReadsAnalysis;
  for (const seqResult of seqResults) {
    const {
      inputSequence: {header: seqName1} = {},
      name: seqName2,
      mutationComments
    } = seqResult;
    const seqName = seqName1 || seqName2;
    const rows = [];
    for (const {triggeredMutations, version, comment} of mutationComments) {
      const muts = shortenMutList(triggeredMutations).map(({
        gene: {name}, text
      }) => name === 'S' ? text : `${geneDisplay[name] || name}:${text}`);
      rows.push({
        'Sequence Name': seqName,
        'Mutation': muts.join(','),
        'Comment': comment,
        'Version': version
      });
    }
    tables.push({
      folder: 'mutation-comments',
      tableName: 'MutComments_' + seqName.replace(/[<>:"/\\|?*]/g, '_'),
      header,
      rows
    });
  }
  return tables;
}

export default mutationComments;
