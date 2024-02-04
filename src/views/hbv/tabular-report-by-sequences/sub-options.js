import seqSummary from './hbv-sequence-summary';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import mutationList from '../../../components/tabular-report/mutation-list';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';
import rawJSON
  from '../../../components/tabular-report/raw-json';

const subOptions = [
  'Sequence summary',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Raw JSON report'
];

const subOptionProcessors = [
  seqSummary,
  mutationList,
  unseqRegions,
  prettyAlignments,
  rawJSON
];

export {subOptions, subOptionProcessors};
