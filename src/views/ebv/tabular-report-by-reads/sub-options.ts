import seqReadsSummary from './ebv-seqreads-summary';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import mutationList from '../../../components/tabular-report/mutation-list';
import assembledConsensus from '../../../components/tabular-report/assembled-consensus';
import prettyAlignments from '../../../components/tabular-report/pretty-alignments';
import rawJSON from '../../../components/tabular-report/raw-json';

/** Available sub-options for sequence-read tabular reports. */
const subOptions: string[] = [
  'Sequence summary',
  'Consensus sequence (FASTA)',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Raw JSON report'
];

/** Processors corresponding to each sub-option. */
const subOptionProcessors: Array<(arg: any) => any> = [
  seqReadsSummary,
  assembledConsensus,
  mutationList,
  unseqRegions,
  prettyAlignments,
  rawJSON
];

export {subOptions, subOptionProcessors};
