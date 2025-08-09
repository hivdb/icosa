import React from 'react';
import {FaLink} from '@react-icons/all-files/fa/FaLink';
import {FaCheck} from '@react-icons/all-files/fa/FaCheck';

import {useReportPaginator} from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SinglePatternReport from './single-report';

const pageTitlePrefix = 'Pattern Analysis Report';

function getPageTitle(patternAnalysis: any[], output: string): string {
  let pageTitle;
  if (
    output === 'printable' ||
    patternAnalysis.length === 0
  ) {
    pageTitle = `${pageTitlePrefix} Printable Version`;
  }
  else {
    const [{name}] = patternAnalysis;
    pageTitle = `${pageTitlePrefix}: ${name}`;
  }
  return pageTitle;
}

interface PatternReportsProps {
  cmtVersion?: string;
  drdbLastUpdate?: string;
  antibodies?: any[];
  output: string;
  match: any;
  router: any;
  loaded: boolean;
  patterns: any[];
  currentSelected?: any;
  patternAnalysis: any[];
  fetchAnother: () => void;
}

/**
 * Render pattern analysis reports with pagination.
 */
function PatternReports({
  cmtVersion,
  output,
  antibodies,
  drdbLastUpdate,
  match,
  router,
  loaded,
  patterns,
  currentSelected,
  patternAnalysis,
  fetchAnother
}: PatternReportsProps): JSX.Element {
  const clickTransition = React.useRef<HTMLSpanElement>(null);
  const onCopy = React.useCallback(
    () => {
      navigator.clipboard.writeText(
        window.location.href
      );
      if (clickTransition.current) {
        clickTransition.current.dataset.onclick = '';
        setTimeout(
          () => {
            if (clickTransition.current) {
              delete clickTransition.current.dataset.onclick;
            }
          },
          10000
        );
      }
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
    currentSelected,
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
    (acc: any, pr: any) => {
      acc[pr.name] = pr;
      return acc;
    },
    {}
  );

  return <>
    {output === 'printable' ?
      <PrintHeader /> :
      paginator
    }
    <main className={style.main} data-loaded={loaded}>
      {patterns.map((pat, idx) => (
        <React.Fragment key={idx}>
          <SinglePatternReport
           key={idx}
           cmtVersion={cmtVersion}
           inputPattern={pat}
           currentSelected={currentSelected}
           patternResult={patResultLookup[pat.name]}
           onObserve={onObserve}
           onDisconnect={onDisconnect}
           output={output}
           name={pat.name}
           index={idx}
           match={match}
           router={router}
           antibodies={antibodies}
           drdbLastUpdate={drdbLastUpdate} />
          {idx + 1 < patternAnalysis.length ?
            <PageBreak /> : null}
        </React.Fragment>
      ))}
    </main>
  </>;
}

export default PatternReports;

