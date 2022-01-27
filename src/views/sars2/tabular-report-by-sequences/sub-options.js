import seqSummary from './sars2-sequence-summary';
import mutations from '../tabular-report/sars2-mutations';
import suscSummary from '../tabular-report/sars2-susc-summary';
import mutComments from '../tabular-report/sars2-mutation-comments';
import prettyAlignments from '../tabular-report/pretty-alignments';

const subOptions = [
  'Sequence summary',
  'Mutation list',
  'Susceptibility summary',
  'Mutation comments',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqSummary,
  mutations,
  suscSummary,
  mutComments,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
