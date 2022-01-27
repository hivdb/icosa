import seqReadsSummary from './sars2-seqreads-summary';
import assembledConsensus from './assembled-consensus';
import mutations from '../tabular-report/sars2-mutations';
import suscSummary from '../tabular-report/sars2-susc-summary';
import mutComments from '../tabular-report/sars2-mutation-comments';
import prettyAlignments from '../tabular-report/pretty-alignments';

const subOptions = [
  'Sequence summary',
  'Consensus sequence (FASTA)',
  'Mutation list',
  'Susceptibility summary',
  'Mutation comments',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqReadsSummary,
  assembledConsensus,
  mutations,
  suscSummary,
  mutComments,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
