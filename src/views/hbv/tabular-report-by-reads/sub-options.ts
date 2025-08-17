import seqReadsSummary from './hbv-seqreads-summary';
import unseqRegions from '../../../components/tabular-report/unseq-regions';
import mutationList from '../../../components/tabular-report/mutation-list';
import assembledConsensus from '../../../components/tabular-report/assembled-consensus';
import prettyAlignments from '../../../components/tabular-report/pretty-alignments';
import rawJSON from '../../../components/tabular-report/raw-json';
import {TabularReportProcessor} from '../../../components/tabular-report/reports';

/**
 * Tabular report sub-options presented to the user in order.
 */
const subOptions = [
  'Sequence summary',
  'Consensus sequence (FASTA)',
  'Mutation list',
  'Unsequenced regions',
  'Pretty amino acid alignments',
  'Raw JSON report'
];

/**
 * Processor functions corresponding to {@link subOptions}.
 */
const subOptionProcessors: TabularReportProcessor[] = [
  seqReadsSummary as TabularReportProcessor,
  assembledConsensus as TabularReportProcessor,
  mutationList as TabularReportProcessor,
  unseqRegions as TabularReportProcessor,
  prettyAlignments as TabularReportProcessor,
  rawJSON as TabularReportProcessor
];

export {subOptions, subOptionProcessors};

