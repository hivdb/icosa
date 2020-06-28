import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag.macro';

import ExtCodfish from './ext-codfish';

import style from './style.module.scss';

const query = gql`
  fragment ExtCodfish on SequenceReadsAnalysis {
    name
    allGeneSequenceReads {
      gene { name }
      internalJsonAllPositionCodonReads(
        mutationOnly: true,
        maxProportion: 1,
        minProportion: 0.002
      )
    }
  }
`;


export default class SeqReadsQA extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    allGeneSequenceReads: PropTypes.arrayOf(
      PropTypes.shape({
        gene: PropTypes.shape({
          name: PropTypes.string.isRequired
        }).isRequired,
        internalJsonAllPositionCodonReads: PropTypes.string.isRequired
      }).isRequired
    ).isRequired
  }

  render() {
    const {output, name, allGeneSequenceReads} = this.props;
    return (
      <section className={style['report-seqreads-qa']}>
        <h2>
          Low abundance mutations
        </h2>
        <ExtCodfish {...{output, name, allGeneSequenceReads}} />
      </section>
    );
  }

}

export {query};
