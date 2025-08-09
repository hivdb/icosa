import React from 'react';
import {
  ReportHeader,
  ValidationReport,
  SeqSummary,
  MutationViewer as MutViewer,
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

interface SingleSequenceReportProps {
  header: string;
  cmtVersion?: string;
  drdbLastUpdate?: string;
  currentSelected?: any;
  antibodies: any[];
  sequenceResult?: any;
  output: string;
  index: number;
  onObserve: (el: Element) => void;
  onDisconnect?: (el: Element) => void;
}

/**
 * Render a single uploaded sequence analysis report.
 */
function SingleSequenceReport({
  cmtVersion,
  drdbLastUpdate,
  antibodies,
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
    ({level}: any) => level === 'CRITICAL'
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
            <SeqSummary.PangoLineage />
            <SeqSummary.Genotype />
            <SeqSummary.OutbreakInfo />
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
            <ReportSection
             titleAnnotation={
               <>Last updated on {formatDate(cmtVersion)}</>
             }
             title="Mutation comments">
              <SARS2MutComments {...sequenceResult} />
            </ReportSection>
            <ReportSection
             className={style['no-page-break']}
             titleAnnotation={
               <>Last updated on {formatDateTime(drdbLastUpdate)}</>
             }
             title="MAb susceptibility summary">
              <AbSuscSummary
               antibodies={antibodies}
               {...sequenceResult}
               {...{output, strain}} />
            </ReportSection>
            {/* Additional susceptibility summaries omitted */}
            <RefsSection />
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
    }: SingleSequenceReportProps,
    {
      index: nextIndex,
      output: nextOutput,
      onObserve: nextOnObserve,
      header: nextHeader,
      sequenceResult: nextResult
    }: SingleSequenceReportProps
  ) => (
    prevIndex === nextIndex &&
    prevOutput === nextOutput &&
    prevOnObserve === nextOnObserve &&
    prevHeader === nextHeader &&
    prevResult === nextResult
  )
);

