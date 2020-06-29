import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';

import config from '../../../config';
import style from './style.module.scss';

export default class MutationStats extends React.Component {

  static propTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    currentCutoff: PropTypes.number.isRequired,
    numPositions: PropTypes.number.isRequired
  }

  get mutationStats() {
    const rows = [];

    let i = 0;
    let breakFlag = false;
    while (i > -1) {
      const row = {};
      for (const {name, query} of config.mutStatTableColumns) {
        if (!query) {
          continue;
        }
        const targetData = this.props[name][i];
        if (!targetData) {
          breakFlag = true;
          break;
        }
        row.cutoff = targetData.percentStart;
        row[name] = targetData.count;
      }
      if (breakFlag) {
        break;
      }
      rows.push(row);
      i ++;
    }

    return rows;
  }

  handleCutoffChange = (event) => {
    const newLoc = {...this.props.match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cutoff = parseFloat(event.currentTarget.dataset.cutoff);
    this.props.router.push(newLoc);
  }

  render() {
    const {mutationStats} = this;
    const {numPositions, currentCutoff} = this.props;
    const {mutStatTableColumns: cols} = config;

    return <table className={style['stat-table']}>
      <thead>
        <tr>
          <th>Mutation detection threshold</th>
          {cols.map(({name, label, type}) => (
            type === 'dividingLine' ?
              <th className={style['dividing-line']} /> :
              <th>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {mutationStats.map((ms, idx) => (
          <tr
           onDoubleClick={this.handleCutoffChange}
           data-cutoff={(ms.cutoff / 100).toFixed(3)}
           data-current={Math.abs(ms.cutoff - currentCutoff * 100) < 1e-5}
           key={idx}>
            <td>{Number((ms.cutoff).toPrecision(1))}%</td>
            {cols.map(({name, label, type, formatter = c=>c}) => (
              type === 'dividingLine' ?
                <td className={style['dividing-line']} /> :
                <td>{formatter(ms[name], numPositions)}</td>
            ))}
          </tr>
        ))}
        <tr className={style.footnote}>
          <td colSpan={8}>
            You can select a different "% cutoff" by
            double clicking corresponding row.
          </td>
        </tr>
      </tbody>
    </table>;
  }
}
