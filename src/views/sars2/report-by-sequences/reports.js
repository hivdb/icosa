import React from 'react';
import PropTypes from 'prop-types';
import {matchShape} from 'found';

import {
  SequenceSidebar
} from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SingleSequenceReport from './single-report';

const pageTitlePrefix = 'Sequence Analysis Report';


export default class SequenceReports extends React.Component {

  static propTypes = {
    output: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    match: matchShape.isRequired,
    loaded: PropTypes.bool.isRequired,
    sequences: PropTypes.array.isRequired,
    currentSelected: PropTypes.object,
    antibodies: PropTypes.array.isRequired,
    sequenceAnalysis: PropTypes.array.isRequired,
    onSelectSequence: PropTypes.func.isRequired
  }

  getPageTitle(sequenceAnalysis, output) {
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
      onSelectSequence,
      currentSelected: {header: curHeader}
    } = this.props;
    for (const entry of entries) {
      const header = entry.target.dataset.seqHeader;
      const index = parseInt(entry.target.dataset.seqIndex);
      const viewportHeight = window.innerHeight;
      const curRatio = Math.max(
        entry.intersectionRatio,
        entry.intersectionRect.height / viewportHeight
      );
      const isIntersecting = entry.isIntersecting;
      const prevRatio = this.prevRatioMap[header] || 0;

      if (
        isIntersecting &&
        curRatio > prevRatio &&
        curRatio > 0.9
      ) {
        // enter
        this.candidateMap[index] = header;
      }
      else if (
        curRatio < prevRatio &&
        curRatio < 0.5
      ) {
        // leave
        delete this.candidateMap[index];
      }
      this.prevRatioMap[header] = curRatio;
    }
    const candidates = Object.entries(this.candidateMap);
    if (candidates.length > 0) {
      candidates.sort(([a], [b]) => a - b);
      const [[,newHeader]] = candidates;
      if (newHeader !== curHeader) {
        onSelectSequence({header: candidates[0][1]});
        this.resetPaginatorScrollOffset();
        curHeader = newHeader;
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

  handlePaginatorSelectSeq = async ({header}) => {
    const {onSelectSequence} = this.props;
    this.preventObserver = true;
    await onSelectSequence({header});
    const event = new CustomEvent(
      '--sierra-report-reset-scroll',
      {detail: {
        header,
        callback: this.resetObserver
      }}
    );
    window.dispatchEvent(event);
    // fallback if the event is not catched
    setTimeout(this.resetObserver, 5000);
  }

  render() {
    const {
      output,
      species, match, loaded,
      sequences, currentSelected,
      antibodies,
      sequenceAnalysis, onSelectSequence
    } = this.props;
    const pageTitle = this.getPageTitle(sequenceAnalysis, output);
    setTitle(pageTitle);
    let indexOffset = 0;
    if (sequenceAnalysis.length > 0) {
      const firstHeader = sequenceAnalysis[0].inputSequence.header;
      indexOffset = sequences.findIndex(
        ({header}) => firstHeader === header
      );
    }

    return <>
      {output === 'printable' ?
        <PrintHeader species={species} /> :
        <SequenceSidebar
         ref={this.paginatorRef}
         currentSelected={currentSelected}
         onSelect={this.handlePaginatorSelectSeq}
         sequences={sequences} />
      }
      <main className={style.main} data-loaded={loaded}>
        {sequenceAnalysis.map((seqResult, idx) => (
          <React.Fragment key={indexOffset + idx}>
            <SingleSequenceReport
             key={indexOffset + idx}
             antibodies={antibodies}
             currentSelected={currentSelected}
             onSelect={onSelectSequence}
             sequenceResult={seqResult}
             onObserve={this.handleObserve}
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
}
