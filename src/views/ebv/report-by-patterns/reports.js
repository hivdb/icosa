import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';
import {FaLink} from '@react-icons/all-files/fa/FaLink';
import {FaCheck} from '@react-icons/all-files/fa/FaCheck';

import {useReportPaginator} from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SinglePatternReport from './single-report';

const pageTitlePrefix = 'Pattern Analysis Report';


function getPageTitle(patternAnalysis, output) {
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


PatternReports.propTypes = {
  output: PropTypes.string.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  loaded: PropTypes.bool.isRequired,
  patterns: PropTypes.array.isRequired,
  currentSelected: PropTypes.object,
  patternAnalysis: PropTypes.array.isRequired,
  fetchAnother: PropTypes.func.isRequired
};

function PatternReports({
  output,
  match,
  router,
  loaded,
  patterns,
  currentSelected,
  patternAnalysis,
  fetchAnother
}) {
  const clickTransition = React.useRef();
  const onCopy = React.useCallback(
    () => {
      navigator.clipboard.writeText(
        window.location.href
      );
      clickTransition.current.dataset.onclick = null;
      setTimeout(
        () => {
          delete clickTransition.current.dataset.onclick;
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
           inputPattern={pat}
           currentSelected={currentSelected}
           patternResult={patResultLookup[pat.name]}
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
