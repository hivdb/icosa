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
  onSelect
}) {

  const {
    onObserve,
    onDisconnect,
    paginator
  } = useReportPaginator({
    inputObjs: allSequenceReads,
    loaded,
    output,
    currentSelected,
    onSelect
  });

  const pageTitle = getPageTitle(sequenceReadsAnalysis, output);
  setTitle(pageTitle);

  const seqReadsResultLookup = sequenceReadsAnalysis.reduce(
    (acc, srr) => {
      acc[srr.name] = srr;
      return acc;
    },
    {}
  );

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
      {allSequenceReads.map((inputSeqReads, idx) => (
        <React.Fragment key={idx}>
          <SingleSeqReadsReport
           key={idx}
           inputSequenceReads={inputSeqReads}
           antibodies={antibodies}
           sequenceReadsResult={seqReadsResultLookup[inputSeqReads.name]}
           onObserve={onObserve}
           onDisconnect={onDisconnect}
           output={output}
           name={inputSeqReads.name}
           index={idx}
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
  onSelect: PropTypes.func.isRequired
};

SeqReadsReports.defaultProps = {
  genes: [],
  antibodies: []
};

export default SeqReadsReports;
