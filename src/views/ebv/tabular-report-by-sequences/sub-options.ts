import seqSummary from './ebv-sequence-summary';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import mutationList from '../../../components/tabular-report/mutation-list';
import prettyAlignments from '../../../components/tabular-report/pretty-alignments';
import rawJSON from '../../../components/tabular-report/raw-json';

/** Available sub-options for sequence tabular reports. */
const subOptions: string[] = [
  'Sequence summary',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Raw JSON report'
];

/** Processors for each sub-option. */
const subOptionProcessors: Array<(arg: any) => any> = [
  seqSummary,
  mutationList,
  unseqRegions,
  prettyAlignments,
  rawJSON
];

export {subOptions, subOptionProcessors};
