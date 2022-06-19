import seqSummary from './hiv-sequence-summary';
import mutationList from '../../../components/tabular-report/mutation-list';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';

const subOptions = [
  'Sequence summary',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqSummary,
  mutationList,
  unseqRegions,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
