import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import {
  // DRInterpretation, DRMutationScores,
  SeqSummary, // MutationStats,
  MutationViewer as MutViewer,
  ReportSection,
  MutationList as MutList,
  RefsSection,
  RefContextWrapper
} from '../../../components/report';

import SARS2MutComments from '../../../components/sars2-mutation-comments';
import AntibodySuscSummary from '../../../components/ab-susc-summary';
import CPSuscSummary from '../../../components/cp-susc-summary';
import VPSuscSummary from '../../../components/vp-susc-summary';

import style from '../style.module.scss';


function HLFirstWord({children, index}) {
  children = children.split(' ');
  return <>
    <h1>{index + 1}. {children[0]}</h1>
    {children.length > 1 ? (
      <p className={style.desc}>{children.slice(1).join(' ')}</p>
    ) : null}
  </>;
}


function scrollTo(top, callback, smoothMaxDelta = 0) {
  const enableSmooth = Math.abs(top - window.pageYOffset) < smoothMaxDelta;
  const checkScroll = () => {
    if (Math.abs(window.pageYOffset - top) < 15) {
      window.removeEventListener('scroll', checkScroll, false);
      document.documentElement.dataset.noSmoothScroll = '';
      setTimeout(() => {
        window.scrollTo({top, behavior: 'auto'});
        callback && setTimeout(callback, 500);
      }, 50);
      delete document.documentElement.dataset.noSmoothScroll;
    }
  };
  window.addEventListener('scroll', checkScroll, false);
  let behavior = 'auto';
  if (enableSmooth) {
    behavior = 'smooth';
  }
  else {
    // disable global smooth scroll
    document.documentElement.dataset.noSmoothScroll = '';
  }
  window.scrollTo({top, behavior});
}


function getCoverages({allReads}) {
  return allReads.map(
    ({gene, position, totalReads}) => ({gene, position, coverage: totalReads})
  );
}


export default class SingleSeqReadsReport extends React.Component {

  static propTypes = {
    antibodies: PropTypes.array.isRequired,
    currentSelected: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
    species: PropTypes.string,
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    sequenceReadsResult: PropTypes.object.isRequired,
    output: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    onObserve: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.headerRef = React.createRef();
  }

  resetScroll = (curName) => {
    let callback = null;
    if (curName.detail) {
      callback = curName.detail.callback;
      curName = curName.detail.name;
    }
    const {
      sequenceReadsResult: {name}
    } = this.props;
    if (name === curName) {
      const headerNode = this.headerRef.current;
      let {top} = headerNode.getBoundingClientRect();
      top += window.pageYOffset - 150;
      scrollTo(top, callback);
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      sequenceReadsResult: {name: prevName}
    } = this.props;
    const {
      sequenceReadsResult: {name: nextName}
    } = nextProps;
    return prevName !== nextName;
  }

  componentDidMount() {
    const {
      output,
      currentSelected: {name: curName} = {},
      onObserve
    } = this.props;
    if (output === 'printable') {
      return;
    }
    const headerNode = this.headerRef.current;
    onObserve(headerNode);
    this.resetScroll(curName);
    window.addEventListener(
      '--sierra-report-reset-scroll',
      this.resetScroll,
      false
    );
  }

  componentWillUnmount() {
    const {output} = this.props;
    if (output === 'printable') {
      return;
    }
    window.removeEventListener(
      '--sierra-report-reset-scroll',
      this.resetScroll,
      false
    );
  }

  render() {
    const {
      antibodies,
      inputSequenceReads,
      sequenceReadsResult,
      sequenceReadsResult: {
        readDepthStats: {p95: coverageUpperLimit},
        allGeneSequenceReads
      },
      output,
      index
    } = this.props;
    const coverages = getCoverages(inputSequenceReads);
    const {
      strain: {display: strain},
      name: seqName
    } = sequenceReadsResult;
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(
        `render SingleSeqReadsReport ${index} ${seqName}`,
        (new Date()).getTime()
      );
    }

    return (
      <article
       className={style['seqreads-article']}>
        <RefContextWrapper>
          <header
           data-seqreads-name={seqName}
           data-seqreads-index={index}
           ref={this.headerRef}
           className={style['seqreads-header']} id={seqName}>
            <HLFirstWord index={index}>{seqName}</HLFirstWord>
          </header>
          <SeqSummary {...sequenceReadsResult} output={output}>
            <SeqSummary.InlineGeneRange />
            <SeqSummary.MedianReadDepth />
            <SeqSummary.PangolinLineage />
            <SeqSummary.MinPrevalence />
            <SeqSummary.MinCodonReads />
          </SeqSummary>
          <ReportSection title="Sequence quality assessment">
            <MutViewer {...{
              coverageUpperLimit: Math.min(500, Math.floor(coverageUpperLimit)),
              allGeneSeqs: allGeneSequenceReads,
              coverages,
              output,
              strain
            }} />
          </ReportSection>
          <ReportSection title="Mutation list">
            <MutList {...sequenceReadsResult} {...{output, strain}} />
          </ReportSection>
          <ReportSection title="Mutation comments">
            <SARS2MutComments {...sequenceReadsResult} />
          </ReportSection>
          <ReportSection title="MAb susceptibility summary">
            <AntibodySuscSummary
             antibodies={antibodies}
             {...sequenceReadsResult}
             {...{output, strain}} />
          </ReportSection>
          <ReportSection title="Convalescent plasma susceptibility summary">
            <CPSuscSummary
             {...sequenceReadsResult} {...{output}} />
          </ReportSection>
          <ReportSection
           title="Plasma from vaccinated persons susceptibility summary">
            <VPSuscSummary
             {...sequenceReadsResult} {...{output}} />
          </ReportSection>
          <RefsSection />
        </RefContextWrapper>
      </article>
    );
  }


}
