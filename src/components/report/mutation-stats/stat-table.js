import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';

import config from '../../../config';
import style from './style.module.scss';
import {SitesType} from './prop-types';

export default class MutationStats extends React.Component {

  static propTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    currentCutoff: PropTypes.number.isRequired,
    usualSites: SitesType.isRequired,
    unusualSites: SitesType.isRequired,
    drmSites: SitesType.isRequired,
    stopCodonSites: SitesType.isRequired,
    apobecSites: SitesType.isRequired,
    apobecDrmSites: SitesType.isRequired,
    numPositions: PropTypes.number.isRequired
  }

  get mutationStats() {
    const {
      usualSites, unusualSites, drmSites,
      stopCodonSites, apobecSites, apobecDrmSites
    } = this.props;
    const numCutoffs = usualSites.length;
    const result = [];
    for (let i = 0; i < numCutoffs; i ++) {
      result.push({
        cutoff: usualSites[i].percentStart,
        numUsuals: usualSites[i].count,
        numUnusuals: unusualSites[i].count,
        numDRMs: drmSites[i].count,
        numApobecs: apobecSites[i].count,
        numStops: stopCodonSites[i].count,
        numApobecDRMs: apobecDrmSites[i].count
      });
    }
    return result;
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
    const {mutStatDisplayColumns: showCols} = config;

    return <table className={style['stat-table']}>
      <thead>
        <tr>
          <th>Mutation detection threshold</th>
          {showCols.numUsuals ? <th># usual mutations</th> : null}
          {showCols.numUnusuals ? <th># unusual mutations</th> : null}
          {showCols.numDRMs ? <th># DRMs</th> : null}
          {showCols.numApobecs || showCols.numStops || showCols.numApobecDRMs ?
            <th className={style['dividing-line']} /> : null}
          {showCols.numApobecs ? <th># signature APOBEC mutations</th> : null}
          {showCols.numStops ? <th># Stop codons</th> : null}
          {showCols.numApobecDRMs ? <th># APOBEC-context DRMs</th> : null}
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
            {showCols.numUsuals ? <td>{ms.numUsuals}</td> : null}
            {showCols.numUnusuals ? <td>
              {ms.numUnusuals}{' '}
              ({(ms.numUnusuals / numPositions * 100).toFixed(1)}%)
            </td> : null}
            {showCols.numDRMs ? <td>{ms.numDRMs}</td> : null}
            {showCols.numApobecs ||
              showCols.numStops ||
              showCols.numApobecDRMs ?
                <td className={style['dividing-line']} /> : null}
            {showCols.numApobecs ? <td>{ms.numApobecs}</td> : null}
            {showCols.numStops ? <td>{ms.numStops}</td> : null}
            {showCols.numApobecDRMs ?
              <td>
                {(ms.numApobecs + ms.numApobecDRMs) > 0 ?
                ms.numApobecDRMs : null}
              </td> : null}
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
