import { FaDownload } from '@react-icons/all-files/fa/FaDownload';
import React from 'react';

import { useDownloadCodFreqs, useReportPaginator } from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SingleSeqReadsReport from './single-report';

const pageTitlePrefix = 'Sequence Reads Analysis Report';

function getPageTitle(sequenceReadsAnalysis: any[], output: string): string {
  let pageTitle;
  if (output === 'printable' || sequenceReadsAnalysis.length === 0) {
    pageTitle = `${pageTitlePrefix} Printable Version`;
  }
  else {
    const [{ name }] = sequenceReadsAnalysis;
    pageTitle = `${pageTitlePrefix}: ${name}`;
  }
  return pageTitle;
}

interface SeqReadsReportsProps {
  config: any;
  output: string;
  match: any;
  router: { replace: (loc: any) => void };
  loaded: boolean;
  allSequenceReads: any[];
  currentSelected?: any;
  sequenceReadsAnalysis: any[];
  mutationPrevalenceSubtypes?: any[];
    fetchAnother: (name: string, updateCurrentSelected: boolean) => Promise<void>;
  extVariables: { includeGenes: string[] };
}

/**
 * Render reports for sequence reads analysis with pagination.
 */
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
  extVariables: { includeGenes }
}: SeqReadsReportsProps) {
  const numSeqs = allSequenceReads.length;

  const { onDownload } = useDownloadCodFreqs(allSequenceReads);

  const { onObserve, onDisconnect, paginator } = useReportPaginator({
    inputObjs: allSequenceReads,
    loaded,
    output,
    currentSelected,
    fetchAnother,
    children: (
      <>
        <useReportPaginator.Button onClick={onDownload}>
          <FaDownload />&nbsp;&nbsp;
          {numSeqs > 1 ? `All ${numSeqs} ` : null}CodFreq File{numSeqs > 1 ? 's' : null}
        </useReportPaginator.Button>
      </>
    )
  });

  const pageTitle = getPageTitle(sequenceReadsAnalysis, output);
  setTitle(pageTitle);

  const seqReadsResultLookup = sequenceReadsAnalysis.reduce(
    (acc: Record<string, any>, srr: any) => {
      acc[srr.name] = srr;
      return acc;
    },
    {}
  );

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('render SeqReadsReports', new Date().getTime());
  }

  return (
    <>
      {output === 'printable' ? (
        <PrintHeader curAnalysis="seqreads-analysis" />
      ) : (
        paginator
      )}
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
              />
            {idx + 1 < sequenceReadsAnalysis.length ? <PageBreak /> : null}
          </React.Fragment>
        ))}
      </main>
    </>
  );
}

export default SeqReadsReports;
