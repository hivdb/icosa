import geneReferences from './gene-references.json';
import regionPresets, {allGenes, highlightGenes} from './region-presets';

const config = {
  graphqlURI: (
    window.__NODE_ENV === 'production' ?
      '/hcv/graphql' :
      'https://hivdb.stanford.edu/hcv/graphql'
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
  geneSynonyms: {},
  mutationDefaultGene: 'NS3',
  mutationPrefills: [],
  sequenceExamples: [
    {
      title: 'Example set 1',
      url: 'downloads/hcv-fasta-examples/PX386717-PX387040.fasta'
    },
    {
      title: 'Example set 2 (NS3)',
      url: 'downloads/hcv-fasta-examples/PZ727692-PZ728743.fasta'
    },
    {
      title: 'Example set 3 (NS5A_NTD)',
      url: 'downloads/hcv-fasta-examples/PZ727692-PZ728743-NS5A_NTD.fasta'
    }
  ],
  messages: {
    'pattern-analysis-form-title': 'Hepatitis C Virus Mutations Analysis',
    'pattern-analysis-form-desc':
      'Enter HCV amino acid mutations with a gene prefix, such as NS3:Q80K. ' +
      'Mutation entry uses the HCV genotype 1 reference sequences.',
    'pattern-analysis-report-title':
      'Hepatitis C Virus Mutations Analysis Report',
    'pattern-analysis-prefill-label': 'Pre-populate mutations:',
    'pattern-analysis-input-label': 'Enter/paste mutations:',
    'pattern-analysis-input-placeholder': 'Enter/paste mutations',
    'sequence-analysis-form-title': 'Hepatitis C Virus Sequence Analysis',
    'sequence-analysis-form-desc':
      'Paste one HCV nucleotide sequence or upload multiple sequences in ' +
      'FASTA format. The report shows the best matching genotype, aligned ' +
      'genes, and mutations.',
    'sequence-analysis-report-title':
      'Hepatitis C Virus Sequence Analysis Report',
    'mut-input-error-invalid-mutation':
      'Enter a gene, position and amino acid, such as NS3:Q80K.',
    'mut-input-error-invalid-gene': 'Unknown gene "$$GENE$$".',
    'mut-input-error-pos-is-zero': 'Position cannot be zero.',
    'mut-input-error-pos-out-of-bounds':
      'Position cannot be greater than $$MAX_POS$$.'
  }
};

export default config;
