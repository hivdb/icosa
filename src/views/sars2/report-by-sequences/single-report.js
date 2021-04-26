import React from 'react';
import PropTypes from 'prop-types';
import {matchShape} from 'found';

import {
  ReportHeader,
  ValidationReport,
  SeqSummary,
  MutationViewer as MutViewer,
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

import style from '../style.module.scss';


function SingleSequenceReport({
  antibodies,
  species,
  match,
  router,
  sequenceResult,
  output,
  header,
  index,
  onObserve,
  onDisconnect
}) {

  const {
    alignedGeneSequences,
    strain: {name: strain} = {}
  } = sequenceResult || {};

  return (
    <article
     data-loaded={!!sequenceResult}
     className={style['sequence-article']}>
      <RefContextWrapper>
        <ReportHeader
         output={output}
         name={header}
         index={index}
         onObserve={onObserve}
         onDisconnect={onDisconnect} />
        {sequenceResult ? <>
          <SeqSummary {...sequenceResult} {...{output, strain}}>
            <SeqSummary.InlineGeneRange />
            <SeqSummary.PrettyPairwise />
            <SeqSummary.PangoLineage />
            <SeqSummary.OutbreakInfo />
          </SeqSummary>
          <ReportSection title="Sequence quality assessment">
            <MutViewer {...{
              allGeneSeqs: alignedGeneSequences,
              output,
              strain
            }} />
            <ValidationReport {...sequenceResult} {...{output, strain}} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           title="Mutation list">
            <MutList {...sequenceResult} {...{output, strain}} />
          </ReportSection>
          <ReportSection title="Mutation comments">
            <SARS2MutComments {...sequenceResult} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           title="MAb susceptibility summary">
            <AbSuscSummary
             antibodies={antibodies}
             {...sequenceResult}
             {...{output, strain}} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           title="Convalescent plasma susceptibility summary">
            <CPSuscSummary
             {...sequenceResult} {...{output}} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           title="Plasma from vaccinated persons susceptibility summary">
            <VPSuscSummary
             {...sequenceResult} {...{output}} />
          </ReportSection>
          <RefsSection />
        </> : null}
      </RefContextWrapper>
    </article>
  );
  
}

SingleSequenceReport.propTypes = {
  currentSelected: PropTypes.object,
  species: PropTypes.string.isRequired,
  match: matchShape.isRequired,
  antibodies: PropTypes.array.isRequired,
  sequenceResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onObserve: PropTypes.func.isRequired
};

export default React.memo(
  SingleSequenceReport,
  (
    {
      index: prevIndex,
      output: prevOutput,
      onObserve: prevOnObserve,
      header: prevHeader,
      sequenceResult: prevResult
    },
    {
      index: nextIndex,
      output: nextOutput,
      onObserve: nextOnObserve,
      header: nextHeader,
      sequenceResult: nextResult
    }
  ) => (
    prevIndex === nextIndex &&
    prevOutput === nextOutput &&
    prevOnObserve === nextOnObserve &&
    prevHeader === nextHeader &&
    prevResult === nextResult
  )
);
