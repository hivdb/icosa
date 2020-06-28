import React from 'react';
import PropTypes from 'prop-types';
import {FaEye, FaEyeSlash} from 'react-icons/fa';

import Button from '../button';
import config from '../../config';
import style from './style.module.scss';

import SubtypeRow from './subtype-row';
import PrettyPairwise from './pretty-pairwise';


export default class SequenceSummary extends React.Component {

  static propTypes = {
    sequenceResult: PropTypes.shape({
      alignedGeneSequences: PropTypes.array.isRequired,
      availableGenes: PropTypes.array.isRequired
    }),
    output: PropTypes.string.isRequired
  }

  static defaultProps = {
    output: 'default'
  }

  constructor() {
    super(...arguments);
    const showSDRMs = this.props.output === 'printable';
    this.state = {
      showSDRMs,
      showPrettyPairwise: false
    };
  }

  togglePrettyPairwise = () => {
    const showPrettyPairwise = !this.state.showPrettyPairwise;
    this.setState({showPrettyPairwise});
  }

  toggleSDRMs = () => {
    const showSDRMs = !this.state.showSDRMs;
    this.setState({showSDRMs});
  }

  render() {
    const {sequenceResult: {
      bestMatchingSubtype,
      subtypes,
      alignedGeneSequences,
      availableGenes}} = this.props;
    const {showSDRMs, showPrettyPairwise} = this.state;

    const disableSDRMs = availableGenes.length === 0;
    const disablePrettyPairwise = availableGenes.length === 0;

    return (
      <section className={style['sequence-summary']}>
        <h2>
          Sequence summary
        </h2>
        <div className={style['buttons-right']}>
          {config.sdrmButtom ?
            <Button
             className={style.button}
             onClick={this.toggleSDRMs} disabled={disableSDRMs}>
              {showSDRMs ?
                <FaEyeSlash className={style['icon-before-text']} /> :
                <FaEye className={style['icon-before-text']} />} SDRMs
            </Button> : null}
          <Button
           className={style.button}
           onClick={this.togglePrettyPairwise}
           disabled={disablePrettyPairwise}>
            {showPrettyPairwise ?
              <FaEyeSlash className={style['icon-before-text']} /> :
              <FaEye className={style['icon-before-text']} />} Pretty pairwise
          </Button>
        </div>
        <div className={style['desc-list']}>
          <dl>
            {alignedGeneSequences.reduce((r, geneSeq, idx) => {
              const gene = config.geneDisplay[geneSeq.gene.name];
              r.push(
                <dt key={`dt-gene-${idx}`}>
                  Sequence includes {gene} gene:
                </dt>
              );
              r.push(
                <dd key={`dd-gene-${idx}`}>
                  codons {geneSeq.firstAA} - {geneSeq.lastAA}
                </dd>
              );
              if (config.showMutationsInSummary) {
                r.push(
                  <dt key={`dt-mut-${idx}`}>
                    {gene} mutations:
                  </dt>
                );
                r.push(
                  <dd key={`dd-mut-${idx}`}>
                    {geneSeq.mutations
                      .filter(({isUnsequenced}) => !isUnsequenced)
                      .map(({text}) => text).join(', ') || 'None'}
                  </dd>
                );
              }
              return r;
            }, [])}
            <SubtypeRow {...{bestMatchingSubtype, subtypes}} />
            {showSDRMs && alignedGeneSequences.reduce((r, geneSeq, idx) => {
              const gene = geneSeq.gene.name;
              r.push(
                <dt key={`dt-${idx}`}>{gene} SDRMs:</dt>);
              r.push(
                <dd key={`dd-${idx}`}>
                  {(() => {
                    const sdrms = geneSeq.sdrms;
                    return sdrms.length > 0 ?
                      sdrms.map(sdrm => sdrm.text).join(", ") :
                      "None";
                  })()}
                </dd>);
              return r;
            }, [])}
          </dl>
        </div>
        {showPrettyPairwise ? <div className={style['pretty-pairwise']}>
          {alignedGeneSequences.map(
            ({gene: {name: gene}, prettyPairwise}, idx) => (
              <PrettyPairwise key={idx} {...{gene, prettyPairwise}} />
            )
          )}
        </div> : null}
      </section>
    );
  }

}
