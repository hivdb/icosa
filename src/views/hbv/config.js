const config = {
  configFromURL: (
    'https://s3-us-west-2.amazonaws.com/cms.hivdb.org/localhost/' +
    'pages/sierra-hbv.json'
  ),
  graphqlURI: (
    window.__NODE_ENV === 'production' ?
      '/graphql' :
      'http://localhost:8111/Sierra-HBV/graphql'),
  cmsStages: {
    'hivdb.stanford.edu': 'cms.hivdb.org/prod',
    'staging.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging',
    'staging2.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging2',
    '*': 's3-us-west-2.amazonaws.com/cms.hivdb.org/localhost'
  },
  mutationTypesByGenes: {
    NP: {
      Other: 'Other'
    },
    VP35: {
      Other: 'Other'
    },
    VP40: {
      Other: 'Other'
    },
    GP: {
      Other: 'Other'
    },
    sGP: {
      Other: 'Other'
    },
    ssGP: {
      Other: 'Other'
    },
    VP30: {
      Other: 'Other'
    },
    VP24: {
      Other: 'Other'
    },
    L: {
      Other: 'Other'
    }
  },
  maxProteinSize: 2210, // L protein
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
