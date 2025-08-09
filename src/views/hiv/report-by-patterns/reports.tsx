import React from 'react';
import { Match, Router } from 'found';
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
 * Derive the page title based on available pattern analysis data.
 */
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
  config: any;
  output: string;
  match: Match;
  router: Router;
  loaded: boolean;
  patterns: any[];
  mutationPrevalenceSubtypes?: any[];
  currentSelected?: any;
  patternAnalysis: any[];
    fetchAnother: (name: string, updateCurrentSelected: boolean) => Promise<void>;
}

/**
 * Component rendering a list of pattern reports.
 */
function PatternReports({
  config,
  output,
  match,
  router,
  loaded,
  patterns,
  mutationPrevalenceSubtypes,
  currentSelected,
  patternAnalysis,
  fetchAnother
}: PatternReportsProps) {
    const clickTransition = React.useRef<HTMLSpanElement>(null);
    const onCopy = React.useCallback(
      () => {
        navigator.clipboard.writeText(window.location.href);
        if (clickTransition.current) {
          clickTransition.current.dataset.onclick = '';
          setTimeout(() => {
            delete clickTransition.current!.dataset.onclick;
          }, 10000);
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
    (acc, pr) => {
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
             config={config}
             currentSelected={currentSelected}
             patternResult={patResultLookup[pat.name]}
             subtypeStats={mutationPrevalenceSubtypes}
             onObserve={onObserve}
             onDisconnect={onDisconnect}
             output={output}
             name={pat.name}
             index={idx}
             match={match}
             router={router} />
          {idx + 1 < patternAnalysis.length ?
            <PageBreak /> : null}
        </React.Fragment>
      ))}
    </main>
  </>;
}

export default PatternReports;
