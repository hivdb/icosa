import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

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


function calcIndexOffset({
  patternAnalysis,
  patterns
}) {
  let indexOffset = 0;
  if (patternAnalysis.length > 0) {
    const [{name: firstName}] = patternAnalysis;
    indexOffset = patterns.findIndex(
      ({name}) => firstName === name
    );
  }
  return indexOffset;
}


function PatternReports({
  output,
  genes,
  antibodies,
  species,
  match,
  router,
  loaded,
  patterns,
  currentSelected,
  patternAnalysis,
  onSelect
}) {

  const {
    onObserve,
    paginator
  } = useReportPaginator({
    inputObjs: patterns,
    loaded,
    output,
    currentSelected,
    onSelect
  });

  const pageTitle = getPageTitle(patternAnalysis, output);
  setTitle(pageTitle);

  const indexOffset = calcIndexOffset({
    patternAnalysis,
    patterns
  });

  return <>
    {output === 'printable' ?
      <PrintHeader species={species} /> :
      paginator
    }
    <main className={style.main} data-loaded={loaded}>
      {patternAnalysis.map((patternResult, idx) => (
        <React.Fragment key={indexOffset + idx}>
          <SinglePatternReport
           key={indexOffset + idx}
           inputPattern={patterns.find(
             ({name}) => patternResult.name === name
           )}
           currentSelected={currentSelected}
           patternResult={patternResult}
           onObserve={onObserve}
           output={output}
           index={indexOffset + idx}
           species={species}
           match={match}
           router={router}
           antibodies={antibodies}
           genes={genes} />
          {idx + 1 < patternAnalysis.length ?
            <PageBreak /> : null}
        </React.Fragment>
      ))}
    </main>
  </>;
}

PatternReports.propTypes = {
  output: PropTypes.string.isRequired,
  species: PropTypes.string,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  loaded: PropTypes.bool.isRequired,
  patterns: PropTypes.array.isRequired,
  currentSelected: PropTypes.object,
  patternAnalysis: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default PatternReports;
