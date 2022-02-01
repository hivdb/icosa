import React from 'react';
import PropTypes from 'prop-types';

import {
  // DRInterpretation, DRMutationScores,
  SeqSummary, // MutationStats,
  MutationViewer as MutViewer,
  ReportHeader,
  ReportSection,
  MutationList as MutList,
  RefsSection,
  RefContextWrapper
} from '../../../components/report';

import SARS2MutComments from '../../../components/sars2-mutation-comments';
import {
  AbSuscSummary,
  CPSuscSummary,
  VPSuscSummary
} from '../../../components/susc-summary';
import {
  formatDate,
  formatDateTime
} from '../format-date';

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
  cmtVersion: PropTypes.string,
  antibodies: PropTypes.array.isRequired,
  drdbLastUpdate: PropTypes.string,
  inputSequenceReads: PropTypes.object.isRequired,
  sequenceReadsResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onObserve: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired
};


function SingleSeqReadsReport({
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
            <SeqSummary.PangoLineage />
            <SeqSummary.Genotype />
            <SeqSummary.OutbreakInfo />
            <SeqSummary.MaxMixtureRate />
            <SeqSummary.MinPrevalence />
            <SeqSummary.MinCodonReads />
            <SeqSummary.ThresholdNomogram />
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
          <ReportSection
           titleAnnotation={<>
             Last updated on {formatDate(cmtVersion)}
           </>}
           title="Mutation comments">
            <SARS2MutComments {...sequenceReadsResult} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           titleAnnotation={<>
             Last updated on {formatDateTime(drdbLastUpdate)}
           </>}
           title="MAb susceptibility summary">
            <AbSuscSummary
             antibodies={antibodies}
             {...sequenceReadsResult}
             {...{output, strain}} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           titleAnnotation={<>
             Last updated on {formatDateTime(drdbLastUpdate)}
           </>}
           title="Convalescent plasma susceptibility summary">
            <CPSuscSummary
             {...sequenceReadsResult} {...{output}} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           titleAnnotation={<>
             Last updated on {formatDateTime(drdbLastUpdate)}
           </>}
           title="Plasma from vaccinated persons susceptibility summary">
            <VPSuscSummary
             {...sequenceReadsResult} {...{output}} />
          </ReportSection>
          <RefsSection />
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
