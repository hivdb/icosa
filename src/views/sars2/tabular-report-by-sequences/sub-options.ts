import seqSummary from './sars2-sequence-summary';
import suscSummary from '../tabular-report/sars2-susc-summary';
import mutComments from '../tabular-report/sars2-mutation-comments';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import mutationList from '../../../components/tabular-report/mutation-list';
import prettyAlignments from '../../../components/tabular-report/pretty-alignments';
import rawJSON from '../../../components/tabular-report/raw-json';
import {TabularReportProcessor} from '../../../components/tabular-report/reports';

/**
 * List of available tabular report sub-options in display order.
 */
const subOptions = [
  'Sequence summary',
  'Mutation list',
  'Unsequenced regions',
  'Susceptibility summary',
  'Mutation comments',
  'Pretty amino acid alignments',
  'Raw JSON report'
];

/**
 * Processor functions corresponding to {@link subOptions}.
 */
const subOptionProcessors: TabularReportProcessor[] = [
  seqSummary as TabularReportProcessor,
  mutationList as TabularReportProcessor,
  unseqRegions as TabularReportProcessor,
  suscSummary as TabularReportProcessor,
  mutComments as TabularReportProcessor,
  prettyAlignments as TabularReportProcessor,
  rawJSON as TabularReportProcessor
];

export {subOptions, subOptionProcessors};
