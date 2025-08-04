import React from 'react';

import {
  SeqSummary,
  MutationViewer as MutViewer,
  ValidationReport,
  ReportHeader,
  DRInterpretation,
  RefContextWrapper
} from '../../../components/report';

import style from '../style.module.scss';

function useCoverages({allReads}: {allReads: any[]}): any[] {
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
  inputSequenceReads: any;
  sequenceReadsResult?: any;
  output: string;
  name: string;
  index: number;
  onObserve: (entry: Element) => void;
  onDisconnect: (entry: Element) => void;
  match?: any;
  router?: any;
}

/**
 * Render a single sequence reads analysis report.
 */
function SingleSeqReadsReport({
  inputSequenceReads,
  sequenceReadsResult,
  output,
  name,
  index,
  onObserve,
  onDisconnect
}: SingleSeqReadsReportProps): JSX.Element {

  const {
    strain: {display: strain} = {},
    readDepthStats: {p95: coverageUpperLimit} = {},
    allGeneSequenceReads,
    drugResistance,
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
            <SeqSummary.Genotype />
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
          {isCritical ? null :
            drugResistance.map((geneDR: any, idx: number) => <React.Fragment key={idx}>
              <DRInterpretation
               suppressLevels
               {...{geneDR, output, strain}} />
            </React.Fragment>)}
        </RefContextWrapper>
      </> : null}
    </article>
  );

}

export default React.memo(
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

