import shortenMutList from '../../../utils/shorten-mutation-list';


function mutationComments({
  currentProgramVersion,
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
  for (const seqResult of sequenceAnalysis) {
    const {
      inputSequence: {header: seqName},
      mutationComments
    } = seqResult;
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
