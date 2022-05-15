import React from 'react';
import PropTypes from 'prop-types';

import {
  ReportHeader,
  ValidationReport,
  SeqSummary,
  MutationViewer as MutViewer,
  DRInterpretation,
  DRMutationScores
} from '../../../components/report';

import useDisabledDrugs from '../use-disabled-drugs';
import style from '../style.module.scss';


SingleSequenceReport.propTypes = {
  header: PropTypes.string,
  currentSelected: PropTypes.object,
  includeGenes: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  sequenceResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  config: PropTypes.shape({
    displayMutationScores: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  }).isRequired,
  onObserve: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func
};

function SingleSequenceReport({
  includeGenes,
  sequenceResult,
  config: {displayMutationScores},
  output,
  header,
  index,
  onObserve,
  onDisconnect
}) {

  const {
    alignedGeneSequences,
    strain: {name: strain} = {},
    validationResults,
    drugResistance
  } = sequenceResult || {};

  const isCritical = !!validationResults && validationResults.some(
    ({level}) => level === 'CRITICAL'
  );

  const disabledDrugs = useDisabledDrugs();

  return (
    <article
     data-loaded={!!sequenceResult}
     className={style['sequence-article']}>
      <ReportHeader
       output={output}
       name={header}
       index={index}
       onObserve={onObserve}
       onDisconnect={onDisconnect} />
      {sequenceResult ? <>
        <SeqSummary {...sequenceResult} {...{output, strain, includeGenes}}>
          <SeqSummary.MultilineGeneRange />
          <SeqSummary.Genotype />
          <SeqSummary.PrettyPairwise />
        </SeqSummary>
        <MutViewer {...{
          title: 'Sequence quality assessment',
          viewCheckboxLabel: 'Collapse genes',
          allGeneSeqs: alignedGeneSequences,
          output,
          strain
        }}>
          <ValidationReport {...sequenceResult} {...{output, strain}} />
        </MutViewer>
        {isCritical ? null :
          drugResistance.map((geneDR, idx) => <React.Fragment key={idx}>
            <DRInterpretation
             {...{geneDR, output, disabledDrugs, strain}} />
            {displayMutationScores.includes(geneDR.gene.name) ?
              <DRMutationScores
               {...{geneDR, output, disabledDrugs, strain}} /> : null}
          </React.Fragment>)}
      </> : null}
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
