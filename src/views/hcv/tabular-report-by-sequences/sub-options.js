import sequenceSummary from './sequence-summary';
import mutationList from './mutation-list';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';
import jsonReport from './json-report';

const subOptions = [
  'Sequence summary',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Raw JSON report'
];

const subOptionProcessors = [
  sequenceSummary,
  mutationList,
  unseqRegions,
  prettyAlignments,
  jsonReport
];

export {subOptions, subOptionProcessors};
