import React from 'react';
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
  AbSuscSummary/*,
  CPSuscSummary,
  VPSuscSummary*/
} from '../../../components/susc-summary';
import {
  formatDate,
  formatDateTime
} from '../format-date';

import style from '../style.module.scss';
import {ObservePayload} from '../../../utils/use-scroll-observer';

interface SinglePatternReportProps {
  name: string;
  cmtVersion?: string;
  drdbLastUpdate?: string;
  currentSelected?: any;
  patternResult?: any;
  output: string;
  index: number;
  antibodies: any[];
  onObserve: (payload: ObservePayload) => void;
  onDisconnect?: (payload: ObservePayload) => void;
}

/**
 * Render a single mutation pattern analysis report.
 */
function SinglePatternReport({
  cmtVersion,
  drdbLastUpdate,
  antibodies = [],
  patternResult,
  output,
  name,
  index,
  onObserve,
  onDisconnect
}: SinglePatternReportProps): React.ReactElement {
  const {
    allGeneMutations,
    validationResults
  } = patternResult || {};

  const isCritical = !!validationResults && validationResults.some(
    ({level}: any) => level === 'CRITICAL'
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
             titleAnnotation={
               <>Last updated on {formatDate(cmtVersion)}</>
             }
             title="Mutation comments">
              <SARS2MutComments {...patternResult} />
            </ReportSection>
            <ReportSection
             className={style['no-page-break']}
             titleAnnotation={
               <>Last updated on {formatDateTime(drdbLastUpdate)}</>
             }
             title="MAb susceptibility summary">
              <AbSuscSummary
               antibodies={antibodies}
               {...patternResult} {...{output}} />
            </ReportSection>
            {/* Additional plasma susceptibility sections omitted */}
            <RefsSection />
          </>}
        </RefContextWrapper>
      </> : null}
    </article>
  );
}

export default SinglePatternReport;

