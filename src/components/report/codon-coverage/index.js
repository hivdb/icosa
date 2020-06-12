import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag.macro';

import CodonCoverageGraph from './codon-coverage-graph';
import style from './style.module.scss';
import {genesPropType} from './prop-types';


export default class CodonReadsCoverage extends React.Component {

  static propTypes = {
    genes: genesPropType,
    internalJsonCodonReadsCoverage: PropTypes.string.isRequired
  }

  render() {
    const {minReadDepth, internalJsonCodonReadsCoverage, genes} = this.props;
    const codonReadsCoverage = JSON.parse(internalJsonCodonReadsCoverage);
    const width = genes.reduce((acc, {length}) => acc + length * 5, 0);

    return <section className={style.codonReadsCoverage}>
      <h2>
        Codon read coverage
      </h2>
      <div className={style.graphContainer}>
        <CodonCoverageGraph 
         containerWidth={width}
         {...{
           codonReadsCoverage,
           minReadDepth,
           genes
         }} />
      </div>
    </section>;
  }

}

const query = gql`
  fragment codonReadsCoverageFragment on SequenceReadsAnalysis {
    internalJsonCodonReadsCoverage
  }
  fragment codonReadsCoverageRootFragment on Root {
    genes {
      strain { name }
      name length
    }
  }
`;

export {query};
