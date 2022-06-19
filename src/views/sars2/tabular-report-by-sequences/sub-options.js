import seqSummary from './sars2-sequence-summary';
import suscSummary from '../tabular-report/sars2-susc-summary';
import mutComments from '../tabular-report/sars2-mutation-comments';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import mutationList from '../../../components/tabular-report/mutation-list';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';

const subOptions = [
  'Sequence summary',
  'Mutation list',
  'Unsequenced regions',
  'Susceptibility summary',
  'Mutation comments',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqSummary,
  mutationList,
  unseqRegions,
  suscSummary,
  mutComments,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
