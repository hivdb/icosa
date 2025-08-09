import React from 'react';
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

function getPageTitle(sequenceReadsAnalysis: any[], output: string): string {
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

interface SeqReadsReportsProps {
  /** Version for mutation comments. */
  cmtVersion?: string;
  /** Last update timestamp of DRDB. */
  drdbLastUpdate?: string;
  /** Rendering output mode. */
  output: string;
  /** List of monoclonal antibodies. */
  antibodies?: any[];
  /** Router match object. */
  match: any;
  /** Router instance. */
  router: any;
  /** Whether all data has loaded. */
  loaded: boolean;
  /** All uploaded sequence reads. */
  allSequenceReads: any[];
  /** Currently selected sequence read. */
  currentSelected?: any;
  /** Analysis results for each sequence read. */
  sequenceReadsAnalysis: any[];
  /** Callback to fetch additional results. */
  fetchAnother: (name: string, updateCurrentSelected: boolean) => Promise<void>;
}

/**
 * Render sequence reads analysis reports with pagination.
 */
const SeqReadsReports: React.FC<SeqReadsReportsProps> = ({
  output,
  cmtVersion,
  antibodies = [],
  drdbLastUpdate,
  match,
  router,
  loaded,
  allSequenceReads,
  currentSelected,
  sequenceReadsAnalysis,
  fetchAnother
}: SeqReadsReportsProps) => {

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
    (acc: any, srr: any) => {
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
           inputSequenceReads={inputSeqReads}
           cmtVersion={cmtVersion}
           antibodies={antibodies}
           drdbLastUpdate={drdbLastUpdate}
           sequenceReadsResult={seqReadsResultLookup[inputSeqReads.name]}
           onObserve={onObserve}
           onDisconnect={onDisconnect}
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
};

export default SeqReadsReports;

