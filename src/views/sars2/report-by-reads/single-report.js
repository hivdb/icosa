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
  RefsSection,
  RefContextWrapper
} from '../../../components/report';

import SARS2MutComments from '../../../components/sars2-mutation-comments';
import AntibodySuscSummary from '../../../components/ab-susc-summary';
import CPSuscSummary from '../../../components/cp-susc-summary';
import VPSuscSummary from '../../../components/vp-susc-summary';

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
  antibodies,
  species,
  match,
  router,
  inputSequenceReads,
  sequenceReadsResult,
  output,
  index,
  onObserve
}) {

  const {
    name,
    strain: {display: strain},
    readDepthStats: {p95: coverageUpperLimit},
    allGeneSequenceReads
  } = sequenceReadsResult;

  const coverages = useCoverages(inputSequenceReads);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(
      `render SingleSeqReadsReport ${index} ${name}`,
      (new Date()).getTime()
    );
  }

  return (
    <article
     className={style['seqreads-article']}>
      <RefContextWrapper>
        <ReportHeader
         output={output}
         name={name}
         index={index}
         onObserve={onObserve} />
        <SeqSummary {...sequenceReadsResult} output={output}>
          <SeqSummary.InlineGeneRange />
          <SeqSummary.MedianReadDepth />
          <SeqSummary.PangolinLineage />
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
        <ReportSection title="Mutation list">
          <MutList {...sequenceReadsResult} {...{output, strain}} />
        </ReportSection>
        <ReportSection title="Mutation comments">
          <SARS2MutComments {...sequenceReadsResult} />
        </ReportSection>
        <ReportSection title="MAb susceptibility summary">
          <AntibodySuscSummary
           antibodies={antibodies}
           {...sequenceReadsResult}
           {...{output, strain}} />
        </ReportSection>
        <ReportSection title="Convalescent plasma susceptibility summary">
          <CPSuscSummary
           {...sequenceReadsResult} {...{output}} />
        </ReportSection>
        <ReportSection
         title="Plasma from vaccinated persons susceptibility summary">
          <VPSuscSummary
           {...sequenceReadsResult} {...{output}} />
        </ReportSection>
        <RefsSection />
      </RefContextWrapper>
    </article>
  );

}

SingleSeqReadsReport.propTypes = {
  antibodies: PropTypes.array.isRequired,
  species: PropTypes.string,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  inputSequenceReads: PropTypes.array.isRequired,
  sequenceReadsResult: PropTypes.object.isRequired,
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
      sequenceReadsResult: {name: prevName}
    },
    {
      index: nextIndex,
      output: nextOutput,
      onObserve: nextOnObserve,
      inputSequenceReads: nextInputSeq,
      sequenceReadsResult: {name: nextName}
    }
  ) => (
    prevIndex === nextIndex &&
    prevOutput === nextOutput &&
    prevOnObserve === nextOnObserve &&
    prevInputSeq === nextInputSeq &&
    prevName === nextName
  )
);
