import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';
import {FaDownload} from '@react-icons/all-files/fa/FaDownload';

import {
  useDownloadCodFreqs,
  useReportPaginator
} from '../../../components/report';
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


SeqReadsReports.propTypes = {
  config: PropTypes.object.isRequired,
  output: PropTypes.string.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  loaded: PropTypes.bool.isRequired,
  allSequenceReads: PropTypes.array.isRequired,
  currentSelected: PropTypes.object,
  sequenceReadsAnalysis: PropTypes.array.isRequired,
  mutationPrevalenceSubtypes: PropTypes.array.isRequired,
  fetchAnother: PropTypes.func.isRequired,
  extVariables: PropTypes.shape({
    includeGenes: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  }).isRequired
};

function SeqReadsReports({
  config,
  output,
  match,
  router,
  loaded,
  allSequenceReads,
  mutationPrevalenceSubtypes,
  currentSelected,
  sequenceReadsAnalysis,
  fetchAnother,
  extVariables: {includeGenes}
}) {

  const numSeqs = allSequenceReads.length;

  const {onDownload} = useDownloadCodFreqs(allSequenceReads);

  const {
    onObserve,
    onDisconnect,
    paginator
  } = useReportPaginator({
    inputObjs: allSequenceReads,
    loaded,
    output,
    currentSelected,
    fetchAnother,
    children: <>
      <useReportPaginator.Button onClick={onDownload}>
        <FaDownload />&nbsp;&nbsp;{numSeqs > 1 ? `All ${numSeqs} ` : null}
        CodFreq File{numSeqs > 1 ? 's' : null}
      </useReportPaginator.Button>
    </>
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
      <PrintHeader curAnalysis="seqreads-analysis" /> :
      paginator
    }
    <main className={style.main} data-loaded={loaded}>
      {allSequenceReads.map((inputSeqReads, idx) => (
        <React.Fragment key={idx}>
          <SingleSeqReadsReport
           key={idx}
           includeGenes={includeGenes}
           inputSequenceReads={inputSeqReads}
           sequenceReadsResult={seqReadsResultLookup[inputSeqReads.name]}
           subtypeStats={mutationPrevalenceSubtypes}
           onObserve={onObserve}
           onDisconnect={onDisconnect}
           config={config}
           output={output}
           name={inputSeqReads.name}
           index={idx}
           match={match}
           router={router} />
          {idx + 1 < sequenceReadsAnalysis.length ?
            <PageBreak /> : null}
        </React.Fragment>
      ))}
    </main>
  </>;

}

export default SeqReadsReports;
