import React from 'react';
import {
  SeqSummary,
  MutationViewer as MutViewer,
  ValidationReport,
  ReportHeader,
  ReportSection,
  MutationList as MutList,
  RefsSection,
  RefContextWrapper
} from '../../../components/report';

import SARS2MutComments from '../../../components/sars2-mutation-comments';
import {
  AbSuscSummary/*,
  CPSuscSummary,
  VPSuscSummary*/
} from '../../../components/susc-summary';
import {
  formatDate,
  formatDateTime
} from '../format-date';

import style from '../style.module.scss';
import {ObservePayload} from '../../../utils/use-scroll-observer';

interface CoveragesInput {
  allReads: Array<{gene: string; position: number; totalReads: number}>;
}

/**
 * Compute coverage information from all reads.
 */
function useCoverages({allReads}: CoveragesInput) {
  return React.useMemo(
    () => allReads.map(
      ({gene, position, totalReads}) => (
        {gene, position, coverage: totalReads}
      )
    ),
    [allReads]
  );
}

interface SingleSeqReadsReportProps {
  /** Mutation comment version. */
  cmtVersion?: string;
  /** List of antibodies. */
  antibodies: any[];
  /** DRDB last update timestamp. */
  drdbLastUpdate?: string;
  /** Input sequence reads. */
  inputSequenceReads: any;
  /** Analysis result for the sequence reads. */
  sequenceReadsResult?: any;
  /** Output mode. */
  output: string;
  /** Sample name. */
  name: string;
  /** Index of the sample. */
  index: number;
  /** Intersection observer callback. */
  onObserve: (payload: ObservePayload) => void;
  /** Intersection observer disconnect callback. */
  onDisconnect: (payload: ObservePayload) => void;
}

/**
 * Render a single sequence read analysis report.
 */
/**
 * Render a single sequence read analysis report.
 *
 * @param props - {@link SingleSeqReadsReportProps} describing the report.
 * @returns JSX element rendering read analysis details.
 */
const SingleSeqReadsReport: React.FC<SingleSeqReadsReportProps> = ({
  cmtVersion,
  antibodies,
  drdbLastUpdate,
  inputSequenceReads,
  sequenceReadsResult,
  output,
  name,
  index,
  onObserve,
  onDisconnect
}: SingleSeqReadsReportProps): JSX.Element => {

  const {
    strain: {display: strain} = {},
    readDepthStats: {p95: coverageUpperLimit} = {},
    allGeneSequenceReads,
    validationResults
  } = sequenceReadsResult || {};

  const isCritical = !!validationResults && validationResults.some(
    ({level}: any) => level === 'CRITICAL'
  );

  const coverages = useCoverages(inputSequenceReads);

  return (
    <article
     data-loaded={!!sequenceReadsResult}
     className={style['seqreads-article']}>
      <ReportHeader
       output={output}
       name={name}
       index={index}
       onObserve={onObserve}
       onDisconnect={onDisconnect} />
      {sequenceReadsResult ? <>
        <RefContextWrapper>
          <SeqSummary {...sequenceReadsResult} output={output}>
            <SeqSummary.DownloadConsensus />
            <SeqSummary.InlineGeneRange />
            <SeqSummary.MedianReadDepth />
            <SeqSummary.PangoLineage />
            <SeqSummary.Genotype />
            <SeqSummary.OutbreakInfo />
            <SeqSummary.MinPositionReads />
            <SeqSummary.MaxMixtureRate />
            <SeqSummary.MinPrevalence />
            <SeqSummary.ThresholdNomogram />
          </SeqSummary>
          <MutViewer {...{
            title: 'Mutation map & quality assessment',
            coverageUpperLimit: Math.min(500, Math.floor(coverageUpperLimit)),
            allGeneSeqs: allGeneSequenceReads,
            coverages,
            output,
            strain
          }}>
            <ValidationReport {...sequenceReadsResult} {...{output, strain}} />
          </MutViewer>
          {isCritical ? null : <>
            <ReportSection
             className={style['no-page-break']}
             title="Mutation list">
              <MutList {...sequenceReadsResult} {...{output, strain}} />
            </ReportSection>
            <ReportSection
             titleAnnotation={
               <>Last updated on {formatDate(cmtVersion)}</>
             }
             title="Mutation comments">
              <SARS2MutComments {...sequenceReadsResult} />
            </ReportSection>
            <ReportSection
             className={style['no-page-break']}
             titleAnnotation={
               <>Last updated on {formatDateTime(drdbLastUpdate)}</>
             }
             title="MAb susceptibility summary">
              <AbSuscSummary
               antibodies={antibodies}
               {...sequenceReadsResult}
               {...{output, strain}} />
            </ReportSection>
            {/* Additional sections omitted for brevity */}
            <RefsSection />
          </>}
        </RefContextWrapper>
      </> : null}
    </article>
  );
};

export default React.memo(
  SingleSeqReadsReport,
  (
    {
      index: prevIndex,
      output: prevOutput,
      onObserve: prevOnObserve,
      inputSequenceReads: prevInputSeq,
      sequenceReadsResult: prevResult
    }: SingleSeqReadsReportProps,
    {
      index: nextIndex,
      output: nextOutput,
      onObserve: nextOnObserve,
      inputSequenceReads: nextInputSeq,
      sequenceReadsResult: nextResult
    }: SingleSeqReadsReportProps
  ) => (
    prevIndex === nextIndex &&
    prevOutput === nextOutput &&
    prevOnObserve === nextOnObserve &&
    prevInputSeq === nextInputSeq &&
    prevResult === nextResult
  )
);

