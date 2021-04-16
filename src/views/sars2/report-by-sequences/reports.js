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


function calcIndexOffset({
  sequenceAnalysis,
  sequences
}) {
  let indexOffset = 0;
  if (sequenceAnalysis.length > 0) {
    const firstHeader = sequenceAnalysis[0].inputSequence.header;
    indexOffset = sequences.findIndex(
      ({header}) => firstHeader === header
    );
  }
  return indexOffset;
}


function SequenceReports({
  output,
  genes,
  antibodies,
  species,
  match,
  router,
  loaded,
  sequences,
  currentSelected,
  sequenceAnalysis,
  onSelect
}) {

  const {
    onObserve,
    paginator
  } = useReportPaginator({
    inputObjs: sequences,
    loaded,
    output,
    currentSelected,
    onSelect
  });

  const pageTitle = getPageTitle(sequenceAnalysis, output);
  setTitle(pageTitle);

  const indexOffset = calcIndexOffset({
    sequenceAnalysis,
    sequences
  });

  return <>
    {output === 'printable' ?
      <PrintHeader species={species} /> :
      paginator
    }
    <main className={style.main} data-loaded={loaded}>
      {sequenceAnalysis.map((seqResult, idx) => (
        <React.Fragment key={indexOffset + idx}>
          <SingleSequenceReport
           key={indexOffset + idx}
           antibodies={antibodies}
           currentSelected={currentSelected}
           sequenceResult={seqResult}
           onObserve={onObserve}
           output={output}
           index={indexOffset + idx}
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
  onSelect: PropTypes.func.isRequired
};

SequenceReports.defaultProps = {
  genes: [],
  antibodies: []
};

export default SequenceReports;
