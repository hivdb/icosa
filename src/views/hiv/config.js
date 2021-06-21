const config = {
  configFromURL: (
    'https://s3-us-west-2.amazonaws.com/cms.hivdb.org/localhost/' +
    'pages/sierra-hiv.json'
  ),
  graphqlURI: (
    window.__NODE_ENV === 'production' ?
      '/graphql' :
      'http://localhost:8111/sierra/graphql'),
  server_host: (
    window.__NODE_ENV === 'production' ?
      '' : 'http://localhost:8111'
  ),
  cmsStages: {
    'hivdb.stanford.edu': 'cms.hivdb.org/prod',
    'staging.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging',
    'staging2.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging2',
    'localhost:3012': 's3-us-west-2.amazonaws.com/cms.hivdb.org/localhost',
    '*': 's3-us-west-2.amazonaws.com/cms.hivdb.org/localhost'
  },
  mutationTypesByGenes: {
    PR: {
      Major: 'Major',
      Accessory: 'Accessory',
      Other: 'Other'
    },
    RT: {
      NRTI: 'NRTI',
      NNRTI: 'NNRTI',
      Other: 'Other'
    },
    IN: {
      Major: 'Major',
      Accessory: 'Accessory',
      Other: 'Other'
    }
  },
  maxProteinSize: 560,  // RT protein
  seqReadsCodonCovBgColors: {
    RdRP: '#f0f0f0',
    S: '#ffffff'
  },
  showCodonCov: true,
  showLowAbundanceMutsChart: true,
  sdrmButton: false,
  showMutationsInSummary: true
};

export default config;
