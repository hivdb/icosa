import React from 'react';
import PropTypes from 'prop-types';
import Griddle from 'griddle-react';
import '../../../styles/griddle-table.scss';

import DRCommentByTypes from '../dr-comment-by-types';

import style from '../style.module.scss';

import {geneToDrugClass} from './common';


export default class GeneMutationPrevalence extends React.Component {

  static propTypes = {
    gene: PropTypes.string.isRequired,
    rows: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    mutationComments: PropTypes.object.isRequired,
    columnMetadata: PropTypes.array.isRequired
  }

  static childContextTypes = {
    expandedRows: PropTypes.object,
    gene: PropTypes.string
  }

  constructor() {
    super(...arguments);
    this.expandedRows = new Set();
  }

  getChildContext() {
    const {expandedRows} = this;
    const {gene} = this.props;
    return {expandedRows, gene};
  }

  handleRowClick = (row) => {
    // This handler override the default Griddle onRowClick handler
    // to record the expansion status of each row for further use
    // (toggle icon)
    if (row.props.hasChildren) {
      let {expandedRows} = this;
      if (row.props.showChildren === false) {
        // the next value will be true
        expandedRows.add(row.props.data.__index__);
      }
      else {
        // the next value will be false
        expandedRows.delete(row.props.data.__index__);
      }
      row.props.toggleChildren();
    }
  }

  render() {
    const {gene, rows, columns,
      mutationComments, columnMetadata} = this.props;
    const drugClass = geneToDrugClass[gene];

    return (
      <section
       className={style['gene-mutation-prevalence']}
       data-drug-class={drugClass}>
        <h2>
          Mutation percentage according to subtype
          and {drugClass} treatment
        </h2>
        <Griddle
         columns={columns}
         onRowClick={this.handleRowClick}
         columnMetadata={columnMetadata}
         useGriddleStyles={false}
         enableSort={false}
         showPager={false}
         resultsPerPage={1000}
         results={rows} />
        <DRCommentByTypes {...mutationComments} />
      </section>
    );
  }
}
