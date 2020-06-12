import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';
import {SitesType} from './prop-types';

export default class MutationStats extends React.Component {

  static propTypes = {
    location: PropTypes.object.isRequired,
    currentCutoff: PropTypes.number.isRequired,
    usualSites: SitesType.isRequired,
    unusualSites: SitesType.isRequired,
    drmSites: SitesType.isRequired,
    stopCodonSites: SitesType.isRequired,
    apobecSites: SitesType.isRequired,
    apobecDrmSites: SitesType.isRequired,
    numPositions: PropTypes.number.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
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
    const newLoc = {...this.props.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cutoff = parseFloat(event.currentTarget.dataset.cutoff);
    this.context.router.push(newLoc);
  }

  render() {
    const {mutationStats} = this;
    const {numPositions, currentCutoff} = this.props;

    return <table className={style['stat-table']}>
      <thead>
        <tr>
          <th>Mutation detection threshold</th>
          <th># usual mutations</th>
          <th># unusual mutations</th>
          <th># DRMs</th>
          <th className={style['dividing-line']} />
          <th># signature APOBEC mutations</th>
          <th># APOBEC-context DRMs</th>
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
            <td>{ms.numUsuals}</td>
            <td>
              {ms.numUnusuals}{' '}
              ({(ms.numUnusuals / numPositions * 100).toFixed(1)}%)
            </td>
            <td>{ms.numDRMs}</td>
            <td className={style['dividing-line']} />
            <td>{ms.numApobecs}</td>
            <td>{(ms.numApobecs + ms.numApobecDRMs) > 0 ?
                 ms.numApobecDRMs : null}</td>
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
