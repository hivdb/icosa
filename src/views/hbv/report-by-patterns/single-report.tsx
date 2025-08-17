import React, {ReactElement} from 'react';
import type { ObservePayload } from '../../../utils/use-scroll-observer';

import {
  MutationViewer as MutViewer,
  ValidationReport,
  ReportHeader,
  ReportSection,
  DRInterpretation,
  RefContextWrapper
} from '../../../components/report';

import style from '../style.module.scss';

interface SinglePatternReportProps {
  name?: string;
  currentSelected?: any;
  patternResult?: any;
  output: string;
  index: number;
  onObserve: (payload: ObservePayload) => void;
  onDisconnect?: (payload: ObservePayload) => void;
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
}: SinglePatternReportProps): ReactElement {
  const {
    allGeneMutations,
    validationResults,
    drugResistance
  } = patternResult || {};

  const isCritical = !!validationResults && validationResults.some(
    ({level}: any) => level === 'CRITICAL'
  );

  const strain = 'HBV';

  return (
    <article
     key={name}
     data-loaded={!!patternResult}
     className={style['pattern-article']}>
      <ReportHeader
       output={output}
       name={name || ''}
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
            drugResistance.map((geneDR: any, idx: number) => <React.Fragment key={idx}>
              <DRInterpretation
               suppressLevels
               {...{geneDR, output, strain}} />
            </React.Fragment>)}
        </RefContextWrapper>
      </> : null}
    </article>
  );
}

export default SinglePatternReport;

