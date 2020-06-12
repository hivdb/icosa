import React from 'react';
import PropTypes from 'prop-types';
import Griddle from 'griddle-react';
import "../../styles/griddle-table.scss";

import {parseMutation} from '../../utils/mutation';

import style from './style.module.scss';

class RuleCol extends React.Component {

  static contextTypes = {
    drugClass: PropTypes.object.isRequired
  }

  render() {
    const {data} = this.props;
    const {drugClass: {name: dcName}} = this.context;
    const [pos] = parseMutation(data);
    if (data === 'Total') {
      return <span>{data}</span>;
    }
    else {
      return (
        <a
         className={style['link-style']}
         href={`/cgi-bin/Marvel.cgi?pos=${pos}&class=${dcName}`}>
          {data}
        </a>
      );
    }
  }

}


class DRClassMutScores extends React.Component {

  static propTypes = {
    drugClass: PropTypes.object.isRequired,
    scores: PropTypes.array.isRequired,
    disabledDrugs: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  }

  static defaultProps = {
    disabledDrugs: ['NFV']
  }

  static childContextTypes = {
    drugClass: PropTypes.object
  }

  getChildContext() {
    const {drugClass} = this.props;
    return {drugClass};
  }

  scoresToTableData(
    scores : Array<{
      drug: {name: string},
      score: number,
      partialScores: Array<{
        mutations: {text: string},
        score: number
      }>
    }>) {
    const map = new Map();
    for (const {drug, partialScores} of scores) {
      for (const mutScore of partialScores) {
        const rule = mutScore.mutations.map(({text}) => text).join(' + ');
        if (!map.has(rule)) {
          // set default values
          map.set(rule, scores.reduce((row, drugScore2) => {
            row[drugScore2.drug.name] = 0;
            return row;
          }, {rule}));
        }
        const row = map.get(rule);
        row[drug.name] = mutScore.score;
      }
    }
    const totalRow = {rule: 'Total'};
    for (const {drug: {name}, score} of scores) {
      totalRow[name] = score;
    }
    return Array.from(map.values()).concat([totalRow]);
  }

  render() {
    const {drugClass, scores} = this.props;
    const disabledDrugs = new Set(this.props.disabledDrugs);
    if (scores.length === 0) {
      return null;
    }
    const columns = ['rule']
      .concat(scores.map(ds => ds.drug.name))
      .filter(d => !disabledDrugs.has(d));
    let columnMetadata = [{
      columnName: 'rule',
      customComponent: RuleCol,
      displayName: drugClass.name,
      sortable: false
    }].concat(scores
      .map(drugScore => ({
        columnName: drugScore.drug.name,
        displayName: drugScore.drug.displayAbbr
      }))
    );
    const data = this.scoresToTableData(scores);

    return (
      <Griddle
       noDataMessage="No drug resistance mutations were found."
       useGriddleStyles={false}
       columns={columns}
       columnMetadata={columnMetadata}
       showPager={false}
       resultsPerPage={1000}
       results={data} />
    );
  }

}



export default class DRMutationScores extends React.Component {

  static propTypes = {
    geneDR: PropTypes.object.isRequired,
    disabledDrugs: PropTypes.arrayOf(
      PropTypes.string.isRequired
    )
  }

  render() {
    const {geneDR, disabledDrugs} = this.props;
    const {algorithm, gene} = geneDR;
    return (
      <section className={style['dr-mutation-scores']}>
        <h2>
          Mutation scoring: {gene.name}
        </h2>
        <div className={style['header-annotation']}>
          {algorithm.family} {algorithm.version} ({algorithm.publishDate})
        </div>
        {geneDR.gene.drugClasses.map((drugClass, idx) => {
          return <DRClassMutScores
           key={idx} {...{drugClass, disabledDrugs}}
           scores={geneDR.drugScores.filter(
              ds => ds.drugClass.name === drugClass.name)}
          />;
        })}
      </section>
    );
  }

}
