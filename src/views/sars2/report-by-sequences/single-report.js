import React from 'react';
import PropTypes from 'prop-types';
import {matchShape} from 'found';

import {
  DRInterpretation,
  DRMutationScores,
  SequenceAnalysisQAChart,
  ValidationReport,
  SequenceSummary as SeqSummary,
  MutationViewer as MutViewer,
  ReportSection
} from '../../../components/report';

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


export default class SingleSequenceReport extends React.Component {

  static propTypes = {
    currentSelected: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
    species: PropTypes.string.isRequired,
    match: matchShape.isRequired,
    sequenceResult: PropTypes.object.isRequired,
    output: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    onObserve: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.headerRef = React.createRef();
  }

  resetScroll = (curHeader) => {
    let callback = null;
    if (curHeader.detail) {
      callback = curHeader.detail.callback;
      curHeader = curHeader.detail.header;
    }
    const {
      sequenceResult: {
        inputSequence: {header}
      }
    } = this.props;
    if (header === curHeader) {
      const headerNode = this.headerRef.current;
      let {top} = headerNode.getBoundingClientRect();
      top += window.pageYOffset - 150;
      scrollTo(top, callback);
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      sequenceResult: {
        inputSequence: {header: prevHeader}
      }
    } = this.props;
    const {
      sequenceResult: {
        inputSequence: {header: nextHeader}
      }
    } = nextProps;
    return prevHeader !== nextHeader;
  }

  componentDidMount() {
    const {
      output,
      currentSelected: {header: curHeader} = {},
      onObserve
    } = this.props;
    if (output === 'printable') {
      return;
    }
    const headerNode = this.headerRef.current;
    onObserve(headerNode);
    this.resetScroll(curHeader);
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
      sequenceResult,
      sequenceResult: {alignedGeneSequences},
      output,
      index,
      species,
      match: {
        location: {state: {disabledDrugs}}
      }
    } = this.props;
    const {
      inputSequence: {header},
      strain: {name: strain},
      validationResults, drugResistance
    } = sequenceResult;
    const isCritical = validationResults.some(
      ({level}) => level === 'CRITICAL');

    return (
      <article
       className={style['sequence-article']}>
        <header
         data-seq-header={header}
         data-seq-index={index}
         ref={this.headerRef}
         className={style['sequence-header']} id={header}>
          <HLFirstWord index={index}>{header}</HLFirstWord>
        </header>
        <SeqSummary {...{sequenceResult, output, strain}}>
          <SeqSummary.GeneRangeInline />
          {/*<SeqSummary.GeneMutations />*/}
          <SeqSummary.PrettyPairwise />
          <SeqSummary.PangolinLineage />
        </SeqSummary>
        <ReportSection title="Sequence quality assessment">
          <MutViewer {...{
            allGeneSeqs: alignedGeneSequences,
            output,
            strain
          }} />
          <ValidationReport {...sequenceResult} {...{output, strain}} />
        </ReportSection>
        <SequenceAnalysisQAChart {...sequenceResult} {...{output, strain}} />
        <ValidationReport {...sequenceResult} {...{output, strain}} />
        {isCritical ? null :
          drugResistance.map((geneDR, idx) => <React.Fragment key={idx}>
            <DRInterpretation
             suppressLevels={species === 'SARS2'}
             {...{geneDR, output, disabledDrugs, strain}} />
            {species === 'SARS2' ? null : <DRMutationScores
             {...{geneDR, output, disabledDrugs, strain}} />}
          </React.Fragment>)}
      </article>
    );
  }
}
