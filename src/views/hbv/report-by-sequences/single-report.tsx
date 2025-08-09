import React, {ReactElement} from 'react';
import type { ObservePayload } from '../../../utils/use-scroll-observer';

import {
  ReportHeader,
  ValidationReport,
  SeqSummary,
  MutationViewer as MutViewer,
  DRInterpretation,
  RefContextWrapper
} from '../../../components/report';

import style from '../style.module.scss';

interface SingleSequenceReportProps {
  header?: string;
  currentSelected?: any;
  sequenceResult?: any;
  output: string;
  index: number;
  onObserve: (payload: ObservePayload) => void;
  onDisconnect?: (payload: ObservePayload) => void;
}

/**
 * Render a single sequence analysis report.
 *
 * @param props - {@link SingleSequenceReportProps} describing the report.
 * @returns Rendered article element.
 */
function SingleSequenceReport({
  sequenceResult,
  output,
  header,
  index,
  onObserve,
  onDisconnect
}: SingleSequenceReportProps): ReactElement {

  const {
    alignedGeneSequences,
    drugResistance,
    strain: {name: strain} = {},
    validationResults
  } = sequenceResult || {};

  const isCritical = !!validationResults && validationResults.some(
    ({level}: any) => level === 'CRITICAL'
  );

  return (
    <article
     data-loaded={!!sequenceResult}
     className={style['sequence-article']}>
      <RefContextWrapper>
        <ReportHeader
         output={output}
         name={header || ''}
         index={index}
         onObserve={onObserve}
         onDisconnect={onDisconnect} />
        {sequenceResult ? <>
          <SeqSummary {...sequenceResult} {...{output, strain}}>
            <SeqSummary.InlineGeneRange />
            <SeqSummary.Genotype />
            <SeqSummary.PrettyPairwise />
          </SeqSummary>
          <MutViewer {...{
            title: 'Mutation map & quality assessment',
            defaultView: 'expansion',
            allGeneSeqs: alignedGeneSequences,
            output,
            strain
          }}>
            <ValidationReport {...sequenceResult} {...{output, strain}} />
          </MutViewer>
          {isCritical ? null :
            drugResistance.map((geneDR: any, idx: number) => <React.Fragment key={idx}>
              <DRInterpretation
               suppressLevels
               {...{geneDR, output, strain}} />
            </React.Fragment>)}
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

