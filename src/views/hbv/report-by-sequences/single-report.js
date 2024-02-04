import React from 'react';
import PropTypes from 'prop-types';

import {
  ReportHeader,
  ValidationReport,
  SeqSummary,
  MutationViewer as MutViewer,
  ReportSection,
  MutationList as MutList,
  RefContextWrapper
} from '../../../components/report';

import style from '../style.module.scss';


SingleSequenceReport.propTypes = {
  header: PropTypes.string,
  currentSelected: PropTypes.object,
  sequenceResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onObserve: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func
};


function SingleSequenceReport({
  sequenceResult,
  output,
  header,
  index,
  onObserve,
  onDisconnect
}) {

  const {
    alignedGeneSequences,
    strain: {name: strain} = {},
    validationResults
  } = sequenceResult || {};

  const isCritical = !!validationResults && validationResults.some(
    ({level}) => level === 'CRITICAL'
  );

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
          </SeqSummary>
          <MutViewer {...{
            title: 'Mutation map & quality assessment',
            hideViewToggler: true,
            defaultView: 'expansion',
            allGeneSeqs: alignedGeneSequences,
            output,
            strain
          }}>
            <ValidationReport {...sequenceResult} {...{output, strain}} />
          </MutViewer>
          {isCritical ? null : <>
            <ReportSection
             className={style['no-page-break']}
             title="Mutation list">
              <MutList {...sequenceResult} {...{output, strain}} />
            </ReportSection>
          </>}
        </> : null}
      </RefContextWrapper>
    </article>
  );

}

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
