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

  renderSingle(sequenceResult, output) {
    const {
      strain: {name: strain},
      validationResults, drugResistance
    } = sequenceResult;
    const {
      species,
      match: {
        location: {state: {disabledDrugs}}
      }
    } = this.props;
    const {inputSequence: {header}} = sequenceResult;
    const isCritical = validationResults.some(
      ({level}) => level === 'CRITICAL');

    const isPrint = output === 'printable';

    return (
      <section className={style.section}>
        {isPrint ? <h2>Sequence {header}</h2> : null}
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
      </section>
    );
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
    const {species} = this.props;
    const pageTitle = this.getPageTitle(sequenceAnalysis, output);
    setTitle(pageTitle);

    return <>
      {output === 'printable' ?
        <PrintHeader species={species} /> :
        <SequenceSidebar
         currentSelected={currentSelected}
         onSelect={onSelectSequence}
         sequences={sequences} />
      }
      <article className={style.article}>
        {sequenceAnalysis.map((seqResult, idx) => <React.Fragment key={idx}>
          {this.renderSingle(seqResult, output)}
          {idx + 1 < sequenceAnalysis.length ?
            <PageBreak /> : null}
        </React.Fragment>)}
      </article>
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
       lazyLoad={output !== 'printable'}
       renderPartialResults={output !== 'printable'} 
       onRequireVariables={this.handleRequireVariables}
       render={this.thenRender} />
    );
    
  }
}
