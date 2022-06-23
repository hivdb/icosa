import React from 'react';
import PropTypes from 'prop-types';

import {
  MutationViewer as MutViewer,
  ValidationReport,
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


SinglePatternReport.propTypes = {
  name: PropTypes.string,
  cmtVersion: PropTypes.string,
  drdbLastUpdate: PropTypes.string,
  currentSelected: PropTypes.object,
  patternResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  antibodies: PropTypes.array.isRequired,
  onObserve: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func
};

SinglePatternReport.defaultProps = {
  antibodies: []
};

function SinglePatternReport({
  cmtVersion,
  drdbLastUpdate,
  antibodies,
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

  const strain = 'SARS2';

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
            <ReportSection
             titleAnnotation={<>
               Last updated on {formatDate(cmtVersion)}
             </>}
             title="Mutation comments">
              <SARS2MutComments {...patternResult} />
            </ReportSection>
            <ReportSection
             className={style['no-page-break']}
             titleAnnotation={<>
               Last updated on {formatDateTime(drdbLastUpdate)}
             </>}
             title="MAb susceptibility summary">
              <AbSuscSummary
               antibodies={antibodies}
               {...patternResult} {...{output}} />
            </ReportSection>
            <ReportSection
             className={style['no-page-break']}
             titleAnnotation={<>
               Last updated on {formatDateTime(drdbLastUpdate)}
             </>}
             title="Convalescent plasma susceptibility summary">
              <CPSuscSummary
               {...patternResult} {...{output}} />
            </ReportSection>
            <ReportSection
             className={style['no-page-break']}
             titleAnnotation={<>
               Last updated on {formatDateTime(drdbLastUpdate)}
             </>}
             title="Plasma from vaccinated persons susceptibility summary">
              <VPSuscSummary
               {...patternResult} {...{output}} />
            </ReportSection>
            <RefsSection />
          </>}
        </RefContextWrapper>
      </> : null}
    </article>
  );
}

export default SinglePatternReport;
