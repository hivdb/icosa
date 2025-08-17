import type {ReactElement} from 'react';
import {Fragment} from 'react';

import {
  useReportPaginator
} from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SingleSequenceReport from './single-report';

const pageTitlePrefix = 'Sequence Analysis Report';


/**
 * Determine the page title for the sequence report.
 *
 * @param sequenceAnalysis - Array of analysis results with sequence headers.
 * @param output - Output mode, e.g. 'printable'.
 * @returns Page title string.
 */
function getPageTitle(
  sequenceAnalysis: Array<{inputSequence: {header: string}}>,
  output: string
): string {
  let pageTitle;
  if (output === 'printable' || sequenceAnalysis.length === 0) {
    pageTitle = `${pageTitlePrefix} Printable Version`;
  }
  else {
    const [{inputSequence: {header}}] = sequenceAnalysis;
    pageTitle = `${pageTitlePrefix}: ${header}`;
  }
  return pageTitle;
}

interface SequenceReportsProps {
  output: string;
  loaded: boolean;
  sequences: any[];
  currentSelected?: {index: number; name: string};
  sequenceAnalysis: any[];
  fetchAnother: (name: string, updateCurrentSelected: boolean) => Promise<void>;
}

/**
 * Render sequence analysis reports with pagination.
 *
 * @param props - {@link SequenceReportsProps} containing data and callbacks.
 * @returns Rendered sequence report list.
 */
function SequenceReports({
  output,
  loaded,
  sequences,
  currentSelected,
  sequenceAnalysis,
  fetchAnother
}: SequenceReportsProps): ReactElement {

  const {
    onObserve,
    onDisconnect,
    paginator
  } = useReportPaginator({
    inputObjs: sequences,
    loaded,
    output,
    currentSelected: currentSelected as {index: number; name: string},
    fetchAnother
  });

  const pageTitle = getPageTitle(sequenceAnalysis, output);
  setTitle(pageTitle);

  const seqResultLookup = sequenceAnalysis.reduce(
    (acc, sr) => {
      acc[sr.inputSequence.header] = sr;
      return acc;
    },
    {}
  );

  return <>
    {output === 'printable' ?
      <PrintHeader curAnalysis="sequence-analysis" /> :
      paginator
    }
    <main className={style.main} data-loaded={loaded}>
      {sequences.map(({header}, idx) => (
        <Fragment key={idx}>
          <SingleSequenceReport
           key={idx}
           currentSelected={currentSelected}
           sequenceResult={seqResultLookup[header]}
           onObserve={onObserve}
           onDisconnect={onDisconnect}
           output={output}
           header={header}
           index={idx} />
          {idx + 1 < sequenceAnalysis.length ? <PageBreak /> : null}
        </Fragment>
      ))}
    </main>
  </>;

}

export default SequenceReports;
