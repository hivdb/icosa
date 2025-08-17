import seqSummary from './hbv-sequence-summary';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import mutationList from '../../../components/tabular-report/mutation-list';
import prettyAlignments from '../../../components/tabular-report/pretty-alignments';
import rawJSON from '../../../components/tabular-report/raw-json';
import {TabularReportProcessor} from '../../../components/tabular-report/reports';

/**
 * Human readable names for available tabular report options.
 */
const subOptions = [
  'Sequence summary',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Raw JSON report'
];

/**
 * Processor functions corresponding to {@link subOptions} in the same order.
 */
const subOptionProcessors: TabularReportProcessor[] = [
  seqSummary as TabularReportProcessor,
  mutationList as TabularReportProcessor,
  unseqRegions as TabularReportProcessor,
  prettyAlignments as TabularReportProcessor,
  rawJSON as TabularReportProcessor
];

export {subOptions, subOptionProcessors};

