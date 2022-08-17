import seqSummary from '../tabular-report/hiv-seq-summary';
import resistanceSummary from '../tabular-report/hiv-resistance-summary';
import mutationList from '../../../components/tabular-report/mutation-list';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import prettyAlignments
  from '../../../components/tabular-report/pretty-alignments';
import rawJSON
  from '../../../components/tabular-report/raw-json';
import xmlResistance from './hiv-xml-resistance';
import algComparison from '../tabular-report/hiv-alg-comparison';

const subOptions = [
  'Sequence summary',
  'Resistance summary',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Algorithm comparison',
  'Raw JSON report',
  'Raw XML report (deprecated)'
];

const subOptionProcessors = [
  seqSummary,
  resistanceSummary,
  mutationList,
  unseqRegions,
  prettyAlignments,
  algComparison,
  rawJSON,
  xmlResistance
];

export {subOptions, subOptionProcessors};
