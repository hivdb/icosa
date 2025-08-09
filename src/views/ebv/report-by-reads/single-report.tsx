import type {ReactElement} from 'react';
import {memo, useMemo} from 'react';
import type {ObservePayload} from '../../../utils/use-scroll-observer';
import {
  // DRInterpretation, DRMutationScores,
  SeqSummary, // MutationStats,
  MutationViewer as MutViewer,
  ValidationReport,
  ReportHeader,
  ReportSection,
  MutationList as MutList,
  RefContextWrapper
} from '../../../components/report';

import style from '../style.module.scss';

interface UseCoveragesArg {
  allReads: Array<{gene: string; position: number; totalReads: number}>;
}

/**
 * Compute coverage objects from raw read data.
 * @param param0 - Object containing all reads.
 * @returns Array of coverage descriptors.
 */
function useCoverages({allReads}: UseCoveragesArg) {
  return useMemo(
    () => allReads.map(
      ({gene, position, totalReads}) => ({gene, position, coverage: totalReads})
    ),
    [allReads]
  );
}

interface SingleSeqReadsReportProps {
  inputSequenceReads: UseCoveragesArg;
  sequenceReadsResult?: any;
  output: string;
  name: string;
  index: number;
  onObserve: (payload: ObservePayload) => void;
  onDisconnect: (payload: ObservePayload) => void;
}

/**
 * Render a single sequence-reads analysis report.
 *
 * @param props - {@link SingleSeqReadsReportProps} describing the report.
 * @returns Rendered article element.
 */
function SingleSeqReadsReport({
  inputSequenceReads,
  sequenceReadsResult,
  output,
  name,
  index,
  onObserve,
  onDisconnect
}: SingleSeqReadsReportProps): ReactElement {

  const {
    strain: {display: strain} = {},
    readDepthStats: {p95: coverageUpperLimit} = {},
    allGeneSequenceReads,
    validationResults
  } = sequenceReadsResult || {};

  const isCritical =
    !!validationResults &&
    validationResults.some(({level}: {level: string}) => level === 'CRITICAL');

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
            <SeqSummary.MinPositionReads />
            <SeqSummary.MaxMixtureRate />
            <SeqSummary.MinPrevalence />
            <SeqSummary.ThresholdNomogram />
          </SeqSummary>
          <MutViewer {...{
            title: 'Mutation map & quality assessment',
            coverageUpperLimit: Math.min(1000, Math.floor(coverageUpperLimit)),
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
          </>}
        </RefContextWrapper>
      </> : null}
    </article>
  );

}


export default memo(
  SingleSeqReadsReport,
  (
    {
      index: prevIndex,
      output: prevOutput,
      onObserve: prevOnObserve,
      inputSequenceReads: prevInputSeq,
      sequenceReadsResult: prevResult
    },
    {
      index: nextIndex,
      output: nextOutput,
      onObserve: nextOnObserve,
      inputSequenceReads: nextInputSeq,
      sequenceReadsResult: nextResult
    }
  ) => (
    prevIndex === nextIndex &&
    prevOutput === nextOutput &&
    prevOnObserve === nextOnObserve &&
    prevInputSeq === nextInputSeq &&
    prevResult === nextResult
  )
);
