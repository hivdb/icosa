export default {
  graphql_url: (
    window.__NODE_ENV === 'production' ?
      '/graphql' :
      'http://localhost:8113/Sierra-SARS2/graphql'),
  server_host: (
    window.__NODE_ENV === 'production' ?
      '' : 'http://localhost:8113'
  ),
  cmsStages: {
    'hivdb.stanford.edu': 'cms.hivdb.org/prod',
    'staging.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging',
    'staging2.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging2',
    '*': 's3-us-west-2.amazonaws.com/cms.hivdb.org/localhost'
  },
  mutationGenePattern: /^(RDRP|S)/i,
  seqReadsDefaultCutoff: 0.2,  // 20%
  mutationTypesByGenes: {
    RdRP: {
      Other: 'Other'
    },
    S: {
      Other: 'Other'
    }
  }
};
