import React from 'react';
import PropTypes from 'prop-types';
import {matchShape} from 'found';

import {
  useReportPaginator
} from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SingleSequenceReport from './single-report';

const pageTitlePrefix = 'Sequence Analysis Report';


function getPageTitle(sequenceAnalysis, output) {
  let pageTitle;
  if (
    output === 'printable' ||
    sequenceAnalysis.length === 0
  ) {
    pageTitle = `${pageTitlePrefix} Printable Version`;
  }
  else {
    const [{inputSequence: {header}}] = sequenceAnalysis;
    pageTitle = `${pageTitlePrefix}: ${header}`;
  }
  return pageTitle;
}


function SequenceReports({
  output,
  genes,
  antibodies,
  drdbLastUpdate,
  species,
  match,
  router,
  loaded,
  sequences,
  currentSelected,
  sequenceAnalysis,
  fetchAnother
}) {

  const {
    onObserve,
    onDisconnect,
    paginator
  } = useReportPaginator({
    inputObjs: sequences,
    loaded,
    output,
    currentSelected,
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
        <React.Fragment key={idx}>
          <SingleSequenceReport
           key={idx}
           antibodies={antibodies}
           drdbLastUpdate={drdbLastUpdate}
           currentSelected={currentSelected}
           sequenceResult={seqResultLookup[header]}
           onObserve={onObserve}
           onDisconnect={onDisconnect}
           output={output}
           header={header}
           index={idx}
           species={species}
           match={match} />
          {idx + 1 < sequenceAnalysis.length ?
            <PageBreak /> : null}
        </React.Fragment>
      ))}
    </main>
  </>;
  
}

SequenceReports.propTypes = {
  output: PropTypes.string.isRequired,
  species: PropTypes.string.isRequired,
  match: matchShape.isRequired,
  loaded: PropTypes.bool.isRequired,
  sequences: PropTypes.array.isRequired,
  currentSelected: PropTypes.object,
  antibodies: PropTypes.array.isRequired,
  sequenceAnalysis: PropTypes.array.isRequired,
  fetchAnother: PropTypes.func.isRequired
};

SequenceReports.defaultProps = {
  genes: [],
  antibodies: []
};

export default SequenceReports;
