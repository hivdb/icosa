import seqSummaries from './sequence-summaries';
import mutComments from './mutation-comments';
import prettyAlignments from './pretty-alignments';

const subOptions = [
  'Sequence quality summaries',
  'Mutation comments',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqSummaries,
  mutComments,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
