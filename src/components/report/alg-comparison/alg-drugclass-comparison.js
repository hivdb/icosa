import React from 'react';
import PropTypes from 'prop-types';
import {FaAngleDoubleRight} from '@react-icons/all-files/fa/FaAngleDoubleRight';

import nl2br from '../../../utils/nl2br';

import style from '../style.module.scss';


AlgDrugClassComparison.propTypes = {
  drugScores: PropTypes.array.isRequired
};

export default function AlgDrugClassComparison({drugScores}) {

  const container = React.useRef();
  const [containerWidth, setContainerWidth] = React.useState(window.innerWidth);

  React.useEffect(
    () => {
      const resize = () => {
        const newContainerWidth = container.current.offsetWidth;
        if (newContainerWidth !== containerWidth) {
          setContainerWidth(containerWidth);
        }
      };
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    },
    [containerWidth]
  );

  const groupedDrugScores = React.useMemo(
    () => Array.from(
      drugScores.reduce((map, drugScore) => {
        const drugName = drugScore.drug.name;
        if (!map.has(drugName)) {
          map.set(drugName, [drugScore.drug, new Map()]);
        }
        map.get(drugName)[1].set(drugScore.algorithm, drugScore);
        return map;
      }, new Map()).values()
    ),
    [drugScores]
  );

  const algorithms = React.useMemo(
    () => Array.from(
      groupedDrugScores.reduce((acc, [, drugScore]) => {
        for (const algorithm of drugScore.keys()) {
          acc.add(algorithm);
        }
        return acc;
      }, new Set())
    ),
    [groupedDrugScores]
  );

  const numAlgs = algorithms.length;

  const allGridsWidth =
      (numAlgs < 3 && containerWidth > 1000) ? '100%' : 400 * numAlgs;
  const scrolled = allGridsWidth !== '100%' && allGridsWidth > containerWidth;

  return (
    <div
     ref={container}
     className={style['alg-drugclass-comparison-container']}>
      <p className={style.instruction}>
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
            {groupedDrugScores.map(([drug, drugScore], idx) => {
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
                      return (
                        <td
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
                        </td>
                      );
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
