import seqSummary from './sars2-sequence-summary';
import prettyAlignments from '../tabular-report/pretty-alignments';

const subOptions = [
  'Sequence summary',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqSummary,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
