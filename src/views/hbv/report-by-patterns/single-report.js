import React from 'react';
import PropTypes from 'prop-types';

import {
  MutationViewer as MutViewer,
  ValidationReport,
  ReportHeader,
  ReportSection,
  MutationList as MutList,
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
    validationResults
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
          {isCritical ? null : <>
            <ReportSection
             className={style['no-page-break']}
             title="Mutation list">
              <MutList {...patternResult} {...{output}} />
            </ReportSection>
          </>}
        </RefContextWrapper>
      </> : null}
    </article>
  );
}

export default SinglePatternReport;
