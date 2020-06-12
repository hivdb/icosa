import React from 'react';
import {routerShape, matchShape} from 'found';

import {
  SeqReadsSidebar, DRInterpretation, DRMutationScores,
  SeqReadsAnalysisQA, SeqReadsSummary, MutationStats
} from '../../components/report';

import SeqReadsAnalysisLayout from
  '../../components/seqreads-analysis-layout';
import setTitle from '../../utils/set-title';

import style from './style.module.scss';
import PrintHeader from './print-header';
import query from './report-by-reads.graphql';

const pageTitlePrefix = 'HIVdb Analysis Report';


export default class HivdbReportBySeqReads extends React.Component {

  static propTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired
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

  renderSingle(sequenceReadsResult, genes, output, key) {
    const {
      strain: {display: strain},
      drugResistance,
      name: seqName,
      validationResults
    } = sequenceReadsResult;
    const {
      match, router,
      match: {location: {state: {disabledDrugs}}}
    } = this.props;
    const isCritical = validationResults.some(
      ({level}) => level === 'CRITICAL');
    const isSevere = validationResults.some(
      ({level}) => level === 'SEVERE_WARNING');

    const isPrint = output === 'printable';

    return (
      <section className={style.section} key={key}>
        {isPrint ? <h2>Sequence {seqName}</h2> : null}
        <SeqReadsSummary
         {...{sequenceReadsResult, genes, output, match, router}} />
        <MutationStats {...sequenceReadsResult} {...{match, output}} />
        <SeqReadsAnalysisQA {...sequenceReadsResult} output={output} />
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
    allSequenceReads, currentSelected, genes,
    sequenceReadsAnalysis, onSelectSequenceReads
  }) => {
    const {match, router} = this.props;  
    const {output} = this;
    const pageTitle = this.getPageTitle(sequenceReadsAnalysis, output);
    setTitle(pageTitle);
    /*
    const {output, sequenceReadsResult} = this.props;
    const seqName = sequenceReadsResult.name;
    let pageTitle = `${pageTitlePrefix}: ${seqName}`;

    if (output === 'printable') {
      pageTitle = `${pageTitlePrefix} Printable Version`;
    }*/
    return <>
      {output === 'printable' ?
        <PrintHeader /> :
        <SeqReadsSidebar
         {...{match, router, currentSelected, allSequenceReads}}
         onSelect={onSelectSequenceReads} />
      }
      <article className={style.article}>
        {sequenceReadsAnalysis.map((seqReadsResult, idx) => (
          this.renderSingle(seqReadsResult, genes, output, idx)
        ))}
      </article>
    </>;
    
  }

  render() {
    const {output} = this;
    const {router, match} = this.props;
    return (
      <SeqReadsAnalysisLayout
       {...{router, match, query}}
       lazyLoad={output !== 'printable'}
       renderPartialResults={output !== 'printable'}
       render={this.thenRender} />
    );
  }

}
