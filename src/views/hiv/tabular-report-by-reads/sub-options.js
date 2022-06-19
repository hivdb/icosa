import seqReadsSummary from './hiv-seqreads-summary';
import mutationList from '../../../components/tabular-report/mutation-list';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import assembledConsensus
  from '../../../components/tabular-report/assembled-consensus';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';

const subOptions = [
  'Sequence summary',
  'Consensus sequence (FASTA)',
  'Mutation list',
  'Unsequenced regions',
  'Mutation comments',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqReadsSummary,
  assembledConsensus,
  mutationList,
  unseqRegions,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
