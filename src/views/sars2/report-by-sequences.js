import React from 'react';
import PropTypes from 'prop-types';
import {routerShape, matchShape} from 'found';

import {
  SequenceSidebar, DRInterpretation, DRMutationScores,
  SequenceAnalysisQAChart, ValidationReport, SequenceSummary
} from '../../components/report';
import PageBreak from '../../components/page-break';

import SequenceAnalysisLayout from
  '../../components/sequence-analysis-layout';
import setTitle from '../../utils/set-title';

import style from './style.module.scss';
import PrintHeader from './print-header';
import query from './report-by-sequences.graphql';

const pageTitlePrefix = 'Sequence Analysis Report';


function HLFirstWord({children, index}) {
  children = children.split(' ');
  return <>
    <h1>{index + 1}. {children[0]}</h1>
    {children.length > 1 ? (
      <p className={style.desc}>{children.slice(1).join(' ')}</p>
    ) : null}
  </>;
}


class SingleSequenceReport extends React.Component {

  static propTypes = {
    currentSelected: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired,
    species: PropTypes.string.isRequired,
    match: matchShape.isRequired,
    sequenceResult: PropTypes.object.isRequired,
    output: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired
  }

  static defaultProps = {
    output: 'default'
  }

  constructor() {
    super(...arguments);
    this.articleRef = React.createRef();
  }

  componentDidMount() {
    const {
      sequenceResult: {
        inputSequence: {header}
      },
      index,
      onSelect,
      currentSelected: {index: curIndex}
    } = this.props;
    const options = {
      root: document,
      rootMargin: '0px',
      threshold: 0.5
    };
    const articleNode = this.articleRef.current;
    this.observer = new IntersectionObserver(observerCallback, options);
    this.observer.observe(articleNode);
    if (index === curIndex) {
      const {top} = articleNode.getBoundingClientRect();
      window.scrollTo(0, top - 150);
    }

    function observerCallback(entries) {
      const [entry] = entries;
      const ratio = entry.intersectionRatio;
      const isIntersecting = entry.isIntersecting;
      if (ratio > 0 && isIntersecting) {
        onSelect({header});
      }
    }
  }

  componentWillUnmount() {
    this.observer.disconnect();
  }

  render() {
    const {
      sequenceResult,
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
       ref={this.articleRef}
       className={style['sequence-article']}>
        <header className={style['sequence-header']} id={header}>
          <HLFirstWord index={index}>{header}</HLFirstWord>
        </header>
        <SequenceSummary {...{sequenceResult, output, strain}} />
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


export default class ReportBySequences extends React.Component {

  static propTypes = {
    species: PropTypes.string.isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired
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
    this.mainRef = React.createRef();
  }

  get output() {
    const {match: {location}} = this.props;
    let output;
    if (location.query) {
      output = location.query.output;
    }
    return output;
  }

  thenRender = ({
    sequences, currentSelected,
    sequenceAnalysis, onSelectSequence
  }) => {
    const {output} = this;
    const {species, match} = this.props;
    const pageTitle = this.getPageTitle(sequenceAnalysis, output);
    setTitle(pageTitle);
    let indexOffset = sequenceAnalysis.findIndex(
      ({inputSequence: {header}}) => header === currentSelected.header
    );
    if (indexOffset > -1) {
      indexOffset = currentSelected.index - indexOffset;
    }

    if (!this.mainRef.current) {
      setTimeout(this.initObserver);
    }

    return <>
      {output === 'printable' ?
        <PrintHeader species={species} /> :
        <SequenceSidebar
         currentSelected={currentSelected}
         onSelect={onSelectSequence}
         sequences={sequences} />
      }
      <main ref={this.mainRef} className={style.main}>
        {sequenceAnalysis.map((seqResult, idx) => (
          <React.Fragment key={indexOffset + idx}>
            <SingleSequenceReport
             currentSelected={currentSelected}
             onSelect={onSelectSequence}
             sequenceResult={seqResult}
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

  handleRequireVariables = (data) => {
    const {match: {location: {state: {algorithm}}}} = this.props;
    data.variables.algorithm = algorithm;
    return data;
  }

  render() {
    const {output} = this;
    const {match, router} = this.props;
    return (
      <SequenceAnalysisLayout
       {...{match, router, query}}
       preLoad
       lazyLoad={output !== 'printable'}
       renderPartialResults={output !== 'printable'} 
       onRequireVariables={this.handleRequireVariables}
       render={this.thenRender} />
    );
    
  }
}
