import seqSummary from './sars2-sequence-summary';
import suscSummary from './sars2-susc-summary';
import mutComments from './sars2-mutation-comments';
import prettyAlignments from './pretty-alignments';

const subOptions = [
  'Sequence summary',
  'Susceptibility summary',
  'Mutation comments',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqSummary,
  suscSummary,
  mutComments,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
