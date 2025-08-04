import React from 'react';
import React from 'react';

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

interface SingleSequenceReportProps {
  header?: string;
  currentSelected?: any;
  sequenceResult?: any;
  output: string;
  index: number;
  onObserve: (entry: Element) => void;
  onDisconnect?: (entry: Element) => void;
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
}: SingleSequenceReportProps): JSX.Element {

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
