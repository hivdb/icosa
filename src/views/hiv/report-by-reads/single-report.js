import React from 'react';
import PropTypes from 'prop-types';

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


SingleSeqReadsReport.propTypes = {
  includeGenes: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  inputSequenceReads: PropTypes.object.isRequired,
  sequenceReadsResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onObserve: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired
};

function SingleSeqReadsReport({
  includeGenes,
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
          <SeqSummary
           {...sequenceReadsResult}
           {...{output, strain, includeGenes}}>
            <SeqSummary.DownloadConsensus />
            <SeqSummary.MultilineGeneRange />
            <SeqSummary.MedianReadDepth />
            <SeqSummary.Genotype />
            <SeqSummary.MaxMixtureRate />
            <SeqSummary.MinPrevalence />
            <SeqSummary.MinCodonReads />
          </SeqSummary>
          <MutViewer {...{
            title: 'Sequence quality assessment',
            coverageUpperLimit: Math.min(500, Math.floor(coverageUpperLimit)),
            allGeneSeqs: allGeneSequenceReads,
            coverages,
            output,
            strain
          }} />
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
