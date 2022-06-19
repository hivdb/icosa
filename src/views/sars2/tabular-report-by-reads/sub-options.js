import seqReadsSummary from './sars2-seqreads-summary';
import suscSummary from '../tabular-report/sars2-susc-summary';
import mutComments from '../tabular-report/sars2-mutation-comments';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import mutationList from '../../../components/tabular-report/mutation-list';
import assembledConsensus
  from '../../../components/tabular-report/assembled-consensus';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';

const subOptions = [
  'Sequence summary',
  'Consensus sequence (FASTA)',
  'Mutation list',
  'Unsequenced regions',
  'Susceptibility summary',
  'Mutation comments',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqReadsSummary,
  assembledConsensus,
  mutationList,
  unseqRegions,
  suscSummary,
  mutComments,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
