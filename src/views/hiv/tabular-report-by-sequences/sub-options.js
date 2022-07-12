import seqSummary from '../tabular-report/hiv-seq-summary';
import resistanceSummary from '../tabular-report/hiv-resistance-summary';
import mutationList from '../../../components/tabular-report/mutation-list';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';
import rawJSON
  from '../../../components/tabular-report/raw-json';
import xmlResistance from './hiv-xml-resistance';

const subOptions = [
  'Sequence summary',
  'Resistance summary',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Raw JSON report',
  'Raw XML report'
];

const subOptionProcessors = [
  seqSummary,
  resistanceSummary,
  mutationList,
  unseqRegions,
  prettyAlignments,
  rawJSON,
  xmlResistance
];

export {subOptions, subOptionProcessors};
