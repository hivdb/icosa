import geneReferences from './gene-references.json';
import regionPresets, {allGenes, highlightGenes} from './region-presets';

const config = {
  configFromURL: (
    'https://s3-us-west-2.amazonaws.com/cms.hivdb.org/localhost/' +
    'pages/sierra-hcv.json'
  ),
  graphqlURI: (
    window.__NODE_ENV === 'production' ?
      '/hcv/graphql' :
      'http://localhost:8118/Sierra-HCV/graphql'
  ),
  cmsStages: {
    'hivdb.stanford.edu': 'cms.hivdb.org/prod',
    'staging.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging',
    'staging2.hivdb.org': 's3-us-west-2.amazonaws.com/cms.hivdb.org/staging2',
    '*': 's3-us-west-2.amazonaws.com/cms.hivdb.org/localhost'
  },
  allGenes,
  highlightGenes,
  regionPresets,
  geneReferences,
  geneDisplay: {},
  geneSynonyms: {}
};

export default config;
