import React from 'react';
import PropTypes from 'prop-types';

import {
  ReportHeader,
  ValidationReport,
  MutationViewer as MutViewer,
  DRInterpretation,
  DRMutationScores
} from '../../../components/report';

import useDisabledDrugs from '../use-disabled-drugs';
import style from '../style.module.scss';


SinglePatternReport.propTypes = {
  name: PropTypes.string,
  currentSelected: PropTypes.object,
  patternResult: PropTypes.object,
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

function SinglePatternReport({
  patternResult,
  config: {displayMutationScores},
  output,
  name,
  index,
  onObserve,
  onDisconnect
}) {
  const {
    strain: {name: strain} = {},
    allGeneMutations,
    validationResults,
    drugResistance
  } = patternResult || {};

  const isCritical = !!validationResults && validationResults.some(
    ({level}) => level === 'CRITICAL'
  );

  const disabledDrugs = useDisabledDrugs();

  return (
    <article
     key={name}
     data-loaded={!!patternResult}
     className={style['pattern-article']}>
      <ReportHeader
       output={output}
       name={name}
       index={index}
       onObserve={onObserve}
       onDisconnect={onDisconnect} />
      {patternResult ? <>
        <MutViewer
         title="Mutation quality assessment"
         viewCheckboxLabel="Collapse genes"
         noUnseqRegions
         allGeneSeqs={allGeneMutations}
         output={output}>
          <ValidationReport {...patternResult} {...{output, strain}} />
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

export default SinglePatternReport;
