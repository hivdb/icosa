import seqSummary from '../tabular-report/hiv-seq-summary';
import resistanceSummary from '../tabular-report/hiv-resistance-summary';
import mutationList from '../../../components/tabular-report/mutation-list';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import assembledConsensus
  from '../../../components/tabular-report/assembled-consensus';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';
import rawJSON
  from '../../../components/tabular-report/raw-json';
import algComparison from '../tabular-report/hiv-alg-comparison';

const subOptions = [
  'Sequence summary',
  'Resistance summary',
  'Consensus sequence (FASTA)',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Algorithm comparison',
  'Raw JSON report'
];

const subOptionProcessors = [
  seqSummary,
  resistanceSummary,
  assembledConsensus,
  mutationList,
  unseqRegions,
  prettyAlignments,
  algComparison,
  rawJSON
];

export {subOptions, subOptionProcessors};
