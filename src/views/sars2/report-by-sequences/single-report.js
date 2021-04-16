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
import AntibodySuscSummary from '../../../components/ab-susc-summary';
import CPSuscSummary from '../../../components/cp-susc-summary';
import VPSuscSummary from '../../../components/vp-susc-summary';

import style from '../style.module.scss';


function SingleSequenceReport({
  antibodies,
  species,
  match,
  router,
  sequenceResult,
  output,
  index,
  onObserve
}) {

  const {
    alignedGeneSequences,
    inputSequence: {header},
    strain: {name: strain}
  } = sequenceResult;

  return (
    <article
     className={style['sequence-article']}>
      <RefContextWrapper>
        <ReportHeader
         output={output}
         name={header}
         index={index}
         onObserve={onObserve} />
        <SeqSummary {...sequenceResult} {...{output, strain}}>
          <SeqSummary.InlineGeneRange />
          <SeqSummary.PrettyPairwise />
          <SeqSummary.PangolinLineage />
        </SeqSummary>
        <ReportSection title="Sequence quality assessment">
          <MutViewer {...{
            allGeneSeqs: alignedGeneSequences,
            output,
            strain
          }} />
          <ValidationReport {...sequenceResult} {...{output, strain}} />
        </ReportSection>
        <ReportSection title="Mutation list">
          <MutList {...sequenceResult} {...{output, strain}} />
        </ReportSection>
        <ReportSection title="Mutation comments">
          <SARS2MutComments {...sequenceResult} />
        </ReportSection>
        <ReportSection title="MAb susceptibility summary">
          <AntibodySuscSummary
           antibodies={antibodies}
           {...sequenceResult}
           {...{output, strain}} />
        </ReportSection>
        <ReportSection title="Convalescent plasma susceptibility summary">
          <CPSuscSummary
           {...sequenceResult} {...{output}} />
        </ReportSection>
        <ReportSection
         title="Plasma from vaccinated persons susceptibility summary">
          <VPSuscSummary
           {...sequenceResult} {...{output}} />
        </ReportSection>
        <RefsSection />
      </RefContextWrapper>
    </article>
  );
  
}

SingleSequenceReport.propTypes = {
  currentSelected: PropTypes.object,
  species: PropTypes.string.isRequired,
  match: matchShape.isRequired,
  antibodies: PropTypes.array.isRequired,
  sequenceResult: PropTypes.object.isRequired,
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
      sequenceResult: {inputSequence: {header: prevHeader}}
    },
    {
      index: nextIndex,
      output: nextOutput,
      onObserve: nextOnObserve,
      sequenceResult: {inputSequence: {header: nextHeader}}
    }
  ) => (
    prevIndex === nextIndex &&
    prevOutput === nextOutput &&
    prevOnObserve === nextOnObserve &&
    prevHeader === nextHeader
  )
);
