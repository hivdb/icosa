import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import {SeqReadsSidebar} from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SingleSeqReadsReport from './single-report';

const pageTitlePrefix = 'Sequence Reads Analysis Report';


export default class SeqReadsReports extends React.Component {

  static propTypes = {
    output: PropTypes.string.isRequired,
    species: PropTypes.string,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    loaded: PropTypes.bool.isRequired,
    allSequenceReads: PropTypes.array.isRequired,
    currentSelected: PropTypes.object,
    sequenceReadsAnalysis: PropTypes.array.isRequired,
    onSelectSeqReads: PropTypes.func.isRequired
  }

  getPageTitle(sequenceReadsAnalysis, output) {
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

  constructor() {
    super(...arguments);
    this.paginatorRef = React.createRef();
  }

  resetPaginatorScrollOffset = () => {
    const event = new Event('--sierra-paginator-reset-scroll');
    window.dispatchEvent(event);
  }

  componentDidMount() {
    const {output} = this.props;
    if (output === 'printable') {
      return;
    }
    const options = {
      root: document,
      rootMargin: '-50px 0px -30% 0px',
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    };
    this.observer = new IntersectionObserver(this.observerCallback, options);
    this.resetObserver();
  }

  resetObserver = () => {
    this.preventObserver = false;
    this.prevRatioMap = {};
    this.candidateMap = {};
  }

  observerCallback = (entries) => {
    if (this.preventObserver) {
      return;
    }
    let {
      onSelectSeqReads,
      currentSelected: {name: curName}
    } = this.props;
    for (const entry of entries) {
      const name = entry.target.dataset.seqreadsName;
      const index = parseInt(entry.target.dataset.seqreadsIndex);
      const viewportHeight = window.innerHeight;
      const curRatio = Math.max(
        entry.intersectionRatio,
        entry.intersectionRect.height / viewportHeight
      );
      const isIntersecting = entry.isIntersecting;
      const prevRatio = this.prevRatioMap[name] || 0;

      if (
        isIntersecting &&
        curRatio > prevRatio &&
        curRatio > 0.9
      ) {
        // enter
        this.candidateMap[index] = name;
      }
      else if (
        curRatio < prevRatio &&
        curRatio < 0.5
      ) {
        // leave
        delete this.candidateMap[index];
      }
      this.prevRatioMap[name] = curRatio;
    }
    const candidates = Object.entries(this.candidateMap);
    if (candidates.length > 0) {
      candidates.sort(([a], [b]) => a - b);
      const [[,newName]] = candidates;
      if (newName !== curName) {
        onSelectSeqReads({name: candidates[0][1]});
        this.resetPaginatorScrollOffset();
        curName = newName;
      }
    }
  }

  componentWillUnmount() {
    const {output} = this.props;
    if (output === 'printable') {
      return;
    }
    this.observer.disconnect();
  }

  handleObserve = (node) => {
    this.observer.observe(node);
  }

  handlePaginatorSelectSeqReads = async ({name}) => {
    const {onSelectSeqReads} = this.props;
    this.preventObserver = true;
    await onSelectSeqReads({name});
    const event = new CustomEvent(
      '--sierra-report-reset-scroll',
      {detail: {
        name,
        callback: this.resetObserver
      }}
    );
    window.dispatchEvent(event);
    // fallback if the event is not catched
    setTimeout(this.resetObserver, 5000);
  }

  render() {
    const {
      output, genes,
      species, match, router, loaded,
      allSequenceReads, currentSelected,
      sequenceReadsAnalysis, onSelectSeqReads
    } = this.props;
    const pageTitle = this.getPageTitle(sequenceReadsAnalysis, output);
    setTitle(pageTitle);
    let indexOffset = 0;
    if (sequenceReadsAnalysis.length > 0) {
      const [{name: firstName}] = sequenceReadsAnalysis;
      indexOffset = allSequenceReads.findIndex(
        ({name}) => firstName === name
      );
    }

    return <>
      {output === 'printable' ?
        <PrintHeader species={species} /> :
        <SeqReadsSidebar
         ref={this.paginatorRef}
         currentSelected={currentSelected}
         onSelect={this.handlePaginatorSelectSeqReads}
         allSequenceReads={allSequenceReads} />
      }
      <main className={style.main} data-loaded={loaded}>
        {sequenceReadsAnalysis.map((seqReadsResult, idx) => (
          <React.Fragment key={indexOffset + idx}>
            <SingleSeqReadsReport
             inputSequenceReads={allSequenceReads.find(
               ({name}) => seqReadsResult.name === name
             )}
             currentSelected={currentSelected}
             onSelect={onSelectSeqReads}
             sequenceReadsResult={seqReadsResult}
             onObserve={this.handleObserve}
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
}
