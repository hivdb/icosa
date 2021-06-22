import seqReadsSummary from './sars2-seqreads-summary';
import assembledConsensus from './assembled-consensus';
import prettyAlignments from '../tabular-report/pretty-alignments';

const subOptions = [
  'Sequence summary',
  'Consensus sequence (FASTA)',
  'Pretty amino acid alignments'
];

const subOptionProcessors = [
  seqReadsSummary,
  assembledConsensus,
  prettyAlignments
];

export {subOptions, subOptionProcessors};
