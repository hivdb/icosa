import seqReadsSummary from './hbv-seqreads-summary';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import mutationList from '../../../components/tabular-report/mutation-list';
import assembledConsensus
  from '../../../components/tabular-report/assembled-consensus';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';
import rawJSON
  from '../../../components/tabular-report/raw-json';

const subOptions = [
  'Sequence summary',
  'Consensus sequence (FASTA)',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Raw JSON report'
];

const subOptionProcessors = [
  seqReadsSummary,
  assembledConsensus,
  mutationList,
  unseqRegions,
  prettyAlignments,
  rawJSON
];

export {subOptions, subOptionProcessors};
