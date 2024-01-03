import React from 'react';
import {useRouter} from 'found';

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

interface ISequenceReportsProps {
  cmtVersion?: string
  drdbLastUpdate?: string
  output: string
  loaded: boolean
  sequences: any[]
  currentSelected: Record<string, any>
  antibodies: any[]
  sequenceAnalysis: any[]
  fetchAnother: () => any
}

SequenceReports.defaultProps = {
  antibodies: []
};

function SequenceReports({
  output,
  antibodies,
  cmtVersion,
  drdbLastUpdate,
  loaded,
  sequences,
  currentSelected,
  sequenceAnalysis,
  fetchAnother
}: ISequenceReportsProps) {
  const {match} = useRouter();

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
           cmtVersion={cmtVersion}
           drdbLastUpdate={drdbLastUpdate}
           currentSelected={currentSelected}
           sequenceResult={seqResultLookup[header]}
           onObserve={onObserve}
           onDisconnect={onDisconnect}
           output={output}
           header={header}
           index={idx} />
          {idx + 1 < sequenceAnalysis.length ?
            <PageBreak /> : null}
        </React.Fragment>
      ))}
    </main>
  </>;

}

export default SequenceReports;
