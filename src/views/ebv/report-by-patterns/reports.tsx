import type {ReactElement} from 'react';
import {Fragment, useCallback, useRef} from 'react';
import {FaLink} from '@react-icons/all-files/fa/FaLink';
import {FaCheck} from '@react-icons/all-files/fa/FaCheck';

import {useReportPaginator} from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SinglePatternReport from './single-report';

const pageTitlePrefix = 'Pattern Analysis Report';


/**
 * Build a page title for the pattern analysis report.
 *
 * @param patternAnalysis - Array of pattern analysis results.
 * @param output - Output mode, such as 'printable'.
 * @returns Generated page title.
 */
function getPageTitle(
  patternAnalysis: Array<{name: string}>,
  output: string
): string {
  let pageTitle;
  if (output === 'printable' || patternAnalysis.length === 0) {
    pageTitle = `${pageTitlePrefix} Printable Version`;
  }
  else {
    const [{name}] = patternAnalysis;
    pageTitle = `${pageTitlePrefix}: ${name}`;
  }
  return pageTitle;
}


interface PatternReportsProps {
  output: string;
  loaded: boolean;
  patterns: any[];
  currentSelected?: {index: number; name: string};
  patternAnalysis: any[];
  fetchAnother: (name: string, updateCurrentSelected: boolean) => Promise<void>;
}

/**
 * Render pattern analysis reports with pagination support.
 *
 * @param props - {@link PatternReportsProps} including data and callbacks.
 * @returns Rendered report list.
 */
function PatternReports({
  output,
  loaded,
  patterns,
  currentSelected,
  patternAnalysis,
  fetchAnother
}: PatternReportsProps): ReactElement {
  const clickTransition = useRef<HTMLSpanElement>(null);
  const onCopy = useCallback(
    () => {
      navigator.clipboard.writeText(
        window.location.href
      );
      clickTransition.current!.dataset.onclick = '';
      setTimeout(
        () => {
          delete clickTransition.current!.dataset.onclick;
        },
        10000
      );
    },
    []
  );

  const {
    onObserve,
    onDisconnect,
    paginator
  } = useReportPaginator({
    inputObjs: patterns,
    loaded,
    output,
    currentSelected: currentSelected as {index: number; name: string},
    fetchAnother,
    children: <>
      <useReportPaginator.Button onClick={onCopy}>
        <span ref={clickTransition} className={style['click-transition']}>
          <FaLink className={style['default']} />
          <FaCheck className={style['onclick']} />
        </span>
        &nbsp;&nbsp;Copy Permanent Link
      </useReportPaginator.Button>
    </>
  });

  const pageTitle = getPageTitle(patternAnalysis, output);
  setTitle(pageTitle);

  const patResultLookup = patternAnalysis.reduce(
    (acc, pr) => {
      acc[pr.name] = pr;
      return acc;
    },
    {}
  );

  return <>
    {output === 'printable' ? <PrintHeader curAnalysis="pattern-analysis" /> : paginator}
    <main className={style.main} data-loaded={loaded}>
      {patterns.map((pat, idx) => (
        <Fragment key={idx}>
          <SinglePatternReport
           key={idx}
           currentSelected={currentSelected}
           patternResult={patResultLookup[pat.name]}
           onObserve={onObserve}
           onDisconnect={onDisconnect}
           output={output}
           name={pat.name}
           index={idx} />
          {idx + 1 < patternAnalysis.length ? <PageBreak /> : null}
        </Fragment>
      ))}
    </main>
  </>;
}

export default PatternReports;
