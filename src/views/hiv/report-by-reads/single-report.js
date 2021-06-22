import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import {
  // DRInterpretation, DRMutationScores,
  SeqSummary, // MutationStats,
  MutationViewer as MutViewer,
  ReportHeader,
  ReportSection,
  MutationList as MutList,
  RefContextWrapper
} from '../../../components/report';

import style from '../style.module.scss';


function useCoverages({allReads}) {
  return React.useMemo(
    () => allReads.map(
      ({gene, position, totalReads}) => (
        {gene, position, coverage: totalReads}
      )
    ),
    [allReads]
  );
}


function SingleSeqReadsReport({
  match,
  router,
  inputSequenceReads,
  sequenceReadsResult,
  output,
  name,
  index,
  onObserve,
  onDisconnect
}) {

  const {
    strain: {display: strain} = {},
    readDepthStats: {p95: coverageUpperLimit} = {},
    allGeneSequenceReads
  } = sequenceReadsResult || {};

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
            <SeqSummary.MaxMixtureRate />
            <SeqSummary.MinPrevalence />
            <SeqSummary.MinCodonReads />
          </SeqSummary>
          <ReportSection title="Sequence quality assessment">
            <MutViewer {...{
              coverageUpperLimit: Math.min(500, Math.floor(coverageUpperLimit)),
              allGeneSeqs: allGeneSequenceReads,
              coverages,
              output,
              strain
            }} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           title="Mutation list">
            <MutList {...sequenceReadsResult} {...{output, strain}} />
          </ReportSection>
        </RefContextWrapper>
      </> : null}
    </article>
  );

}

SingleSeqReadsReport.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  inputSequenceReads: PropTypes.object.isRequired,
  sequenceReadsResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onObserve: PropTypes.func.isRequired
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
