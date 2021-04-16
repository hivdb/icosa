import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import {useReportPaginator} from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SingleSeqReadsReport from './single-report';

const pageTitlePrefix = 'Sequence Reads Analysis Report';


function getPageTitle(sequenceReadsAnalysis, output) {
  let pageTitle;
  if (
    output === 'printable' ||
    sequenceReadsAnalysis.length === 0
  ) {
    pageTitle = `${pageTitlePrefix} Printable Version`;
  }
  else {
    const [{name}] = sequenceReadsAnalysis;
    pageTitle = `${pageTitlePrefix}: ${name}`;
  }
  return pageTitle;
}


function calcIndexOffset({
  sequenceReadsAnalysis,
  allSequenceReads
}) {
  let indexOffset = 0;
  if (sequenceReadsAnalysis.length > 0) {
    const [{name: firstName}] = sequenceReadsAnalysis;
    indexOffset = allSequenceReads.findIndex(
      ({name}) => firstName === name
    );
  }
  return indexOffset;
}


function SeqReadsReports({
  output,
  genes,
  antibodies,
  species,
  match,
  router,
  loaded,
  allSequenceReads,
  currentSelected,
  sequenceReadsAnalysis,
  onSelectSeqReads
}) {

  const {
    onObserve,
    paginator
  } = useReportPaginator({
    inputObjs: allSequenceReads,
    loaded,
    output,
    currentSelected,
    onSelect: onSelectSeqReads
  });

  const pageTitle = getPageTitle(sequenceReadsAnalysis, output);
  setTitle(pageTitle);

  const indexOffset = calcIndexOffset({
    sequenceReadsAnalysis,
    allSequenceReads
  });

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('render SeqReadsReports', (new Date()).getTime());
  }

  return <>
    {output === 'printable' ?
      <PrintHeader species={species} /> :
      paginator
    }
    <main className={style.main} data-loaded={loaded}>
      {sequenceReadsAnalysis.map((seqReadsResult, idx) => (
        <React.Fragment key={indexOffset + idx}>
          <SingleSeqReadsReport
           key={indexOffset + idx}
           inputSequenceReads={allSequenceReads.find(
             ({name}) => seqReadsResult.name === name
           )}
           antibodies={antibodies}
           sequenceReadsResult={seqReadsResult}
           onObserve={onObserve}
           output={output}
           index={indexOffset + idx}
           species={species}
           match={match}
           router={router}
           genes={genes} />
          {idx + 1 < sequenceReadsAnalysis.length ?
            <PageBreak /> : null}
        </React.Fragment>
      ))}
    </main>
  </>;
  
}

SeqReadsReports.propTypes = {
  output: PropTypes.string.isRequired,
  genes: PropTypes.array.isRequired,
  antibodies: PropTypes.array.isRequired,
  species: PropTypes.string,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  loaded: PropTypes.bool.isRequired,
  allSequenceReads: PropTypes.array.isRequired,
  currentSelected: PropTypes.object,
  sequenceReadsAnalysis: PropTypes.array.isRequired,
  onSelectSeqReads: PropTypes.func.isRequired
};

SeqReadsReports.defaultProps = {
  genes: [],
  antibodies: []
};

export default SeqReadsReports;
