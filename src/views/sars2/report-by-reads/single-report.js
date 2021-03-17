import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import {
  DRInterpretation, DRMutationScores,
  SeqSummary, MutationStats,
  MutationViewer as MutViewer,
  ReportSection
} from '../../../components/report';

import AntibodySuscSummary from '../../../components/ab-susc-summary';

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
      inputSequenceReads,
      sequenceReadsResult,
      sequenceReadsResult: {
        readDepthStats: {p95: coverageUpperLimit},
        allGeneSequenceReads
      },
      output,
      index,
      match, router,
      match: {location: {state: {disabledDrugs}}}
    } = this.props;
    const coverages = getCoverages(inputSequenceReads);
    const {
      strain: {display: strain},
      drugResistance,
      name: seqName,
      validationResults
    } = sequenceReadsResult;

    const isCritical = validationResults.some(
      ({level}) => level === 'CRITICAL');
    const isSevere = validationResults.some(
      ({level}) => level === 'SEVERE_WARNING');

    return (
      <article
       className={style['seqreads-article']}>
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
            coverageUpperLimit: Math.floor(coverageUpperLimit),
            allGeneSeqs: allGeneSequenceReads,
            coverages,
            output,
            strain
          }} />
        </ReportSection>
        <ReportSection title="MAb susceptibility summary">
          <AntibodySuscSummary {...sequenceReadsResult} {...{output, strain}} />
        </ReportSection>
        <MutationStats {...sequenceReadsResult} {...{match, router, output}} />
        {/* TODO: RangeError: Maximum call stack size exceeded
        <SeqReadsAnalysisQA {...sequenceReadsResult} output={output} /> */}
        {/*<ValidationReport {...sequenceReadsResult} output={output} />*/}
        {isCritical ?
          <p>
            The rest of the report is unavailable or suppressed
            due to failed quality assessment (critical).
          </p> :
          drugResistance.map((geneDR, idx) => [
            <DRInterpretation
             key={`dri-${idx}`}
             suppressDRI={isSevere}
             {...{strain, geneDR, output, disabledDrugs}} />,
            isSevere ? null :
            <DRMutationScores
             key={`ms-${idx}`}
             {...{strain, geneDR, output, disabledDrugs}} />
          ])}
      </article>
    );
  }


}
