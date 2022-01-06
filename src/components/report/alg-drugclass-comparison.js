import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {FaAngleDoubleRight} from '@react-icons/all-files/fa/FaAngleDoubleRight';
import {FaExpand} from '@react-icons/all-files/fa/FaExpand';
import {FaCompress} from '@react-icons/all-files/fa/FaCompress';

import nl2br from '../../utils/nl2br';
import Button from '../button';

import style from './style.module.scss';


export default class AlgDrugClassComparison extends React.Component {

  static propTypes = {
    drugScores: PropTypes.array.isRequired
  }

  constructor() {
    super(...arguments);
    this.state = {
      containerWidth: window.innerWidth,
      containerExpanded: false
    };
  }

  componentDidMount() {
    this._resizeEvent = () => {
      const containerWidth = this.refs.container.offsetWidth;
      if (containerWidth !== this.state.containerWidth) {
        this.setState({containerWidth});
      }
    };
    this._resizeEvent();
    window.addEventListener('resize', this._resizeEvent);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeEvent);
  }

  toggleContainerExpanded = () => {
    let {containerExpanded} = this.state;
    containerExpanded = !containerExpanded;
    if (containerExpanded) {
      this.setState({containerWidth: window.innerWidth});
      this.origScrollX = window.scrollX;
      this.origScrollY = window.scrollY;
      window.scrollTo(0, 0);
    }
    else {
      setTimeout(() => {
        window.scrollTo(this.origScrollX, this.origScrollY);
      }, 0);
    }
    this.setState({containerExpanded});
  }

  groupDrugScores(drugScores) {
    return Array.from(
      drugScores.reduce((map, drugScore) => {
        const drugName = drugScore.drug.name;
        if (!map.has(drugName)) {
          map.set(drugName, [drugScore.drug, new Map()]);
        }
        map.get(drugName)[1].set(drugScore.algorithm, drugScore);
        return map;
      }, new Map()).values()
    );
  }

  findAlgorithms(drugScores) {
    return Array.from(
      drugScores.reduce((acc, [, drugScore]) => {
        for (const algorithm of drugScore.keys()) {
          acc.add(algorithm);
        }
        return acc;
      }, new Set())
    );
  }

  render() {
    let {drugScores} = this.props;
    const {containerWidth, containerExpanded} = this.state;
    drugScores = this.groupDrugScores(drugScores);
    const algorithms = this.findAlgorithms(drugScores);
    const numAlgs = algorithms.length;

    const allGridsWidth =
      (numAlgs < 3 && containerWidth > 1000) ? '100%' : 400 * numAlgs;
    const scrolled = allGridsWidth !== '100%' && allGridsWidth > containerWidth;

    return (
      <div
       ref="container"
       className={classNames(
         style['alg-drugclass-comparison-container'],
         containerExpanded ? style.expanded : null
       )}>
        <p className={style.instruction}>
          <Button onClick={this.toggleContainerExpanded} btnSize="small">
            {containerExpanded ?
              <FaCompress /> : <FaExpand />}
          </Button>
          {scrolled ?
            <span>Scroll right for more <FaAngleDoubleRight /></span> : '\xa0'}
        </p>
        <div className={style['alg-drugclass-comparison']}>
          <table className={style['alg-comparison-table']}>
            <thead>
              <tr>
                <th />
                {algorithms.map((alg, idx) => (
                  <th key={idx}>
                    <div className={style['alg-alg-name']}>{alg}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drugScores.map(([drug, drugScore], idx) => {
                if (drug.displayAbbr === 'NFV') {
                  return null;
                }
                let prevSIR;
                let isDiff = false;
                for (const {SIR} of drugScore.values()) {
                  if (prevSIR && prevSIR !== SIR) {
                    isDiff = true;
                    break;
                  }
                  prevSIR = SIR;
                }

                return (
                  <tr key={idx}>
                    <th>
                      <div className={style['alg-drug-name']}>
                        {drug.displayAbbr}
                      </div>
                    </th>
                    {algorithms.map(
                      (alg, idx) => {
                        const ds = drugScore.get(alg);
                        return <td
                         key={idx}
                         className={isDiff ? style['cell-diff'] : null}>
                          <div className={style['alg-comparison-card']}>
                            <dl>
                              {ds ? <>
                                <dt>SIR:</dt>
                                <dd>{ds.SIR}</dd>
                                <dt title="Interpretation">Intrp:</dt>
                                <dd>{ds.interpretation}</dd>
                                <dt title="Explanation">Expln:</dt>
                                <dd>{nl2br(ds.explanation)}</dd>
                              </> : 'Drug Score Not Available'}
                            </dl>
                          </div>
                        </td>;
                      }
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
