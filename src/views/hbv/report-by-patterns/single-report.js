import React from 'react';
import PropTypes from 'prop-types';

import {
  MutationViewer as MutViewer,
  ValidationReport,
  ReportHeader,
  ReportSection,
  DRInterpretation,
  RefsSection,
  RefContextWrapper
} from '../../../components/report';

import style from '../style.module.scss';


SinglePatternReport.propTypes = {
  name: PropTypes.string,
  currentSelected: PropTypes.object,
  patternResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onObserve: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func
};

function SinglePatternReport({
  patternResult,
  output,
  name,
  index,
  onObserve,
  onDisconnect
}) {
  const {
    allGeneMutations,
    validationResults,
    drugResistance
  } = patternResult || {};

  const isCritical = !!validationResults && validationResults.some(
    ({level}) => level === 'CRITICAL'
  );

  const strain = 'HBV';

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
        <RefContextWrapper>
          <MutViewer
           title="Mutation map & quality assessment"
           noUnseqRegions
           allGeneSeqs={allGeneMutations}
           output={output}>
            <ValidationReport {...patternResult} {...{output, strain}} />
          </MutViewer>
          {isCritical ? null :
            drugResistance.map((geneDR, idx) => <React.Fragment key={idx}>
              <DRInterpretation
               suppressLevels
               {...{geneDR, output, strain}} />
            </React.Fragment>)}
          <RefsSection />
        </RefContextWrapper>
      </> : null}
    </article>
  );
}

export default SinglePatternReport;
