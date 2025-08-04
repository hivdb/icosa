import React from 'react';

import {
  MutationViewer as MutViewer,
  ValidationReport,
  ReportHeader,
  ReportSection,
  MutationList as MutList,
  RefContextWrapper
} from '../../../components/report';

import style from '../style.module.scss';

interface SinglePatternReportProps {
  name?: string;
  currentSelected?: any;
  patternResult?: any;
  output: string;
  index: number;
  onObserve: (entry: Element) => void;
  onDisconnect?: (entry: Element) => void;
}

/**
 * Render a single pattern analysis report article.
 *
 * @param props - {@link SinglePatternReportProps} describing the report.
 * @returns Rendered report element.
 */
function SinglePatternReport({
  patternResult,
  output,
  name,
  index,
  onObserve,
  onDisconnect
}: SinglePatternReportProps): JSX.Element {
  const {
    allGeneMutations,
    validationResults
  } = patternResult || {};

  const isCritical = !!validationResults && validationResults.some(
    ({level}) => level === 'CRITICAL'
  );

  const strain = 'SEV';

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
