import React from 'react';
import {FaAngleDoubleRight} from '@react-icons/all-files/fa/FaAngleDoubleRight';

import nl2br from '../../../utils/nl2br';
import type {AlgDrugClassComparisonProps, Drug, DrugScore} from './types';

import style from '../style.module.scss';

/**
 * Display comparison details for a specific drug class across algorithms.
 *
 * @param drugScores - List of scores for each drug and algorithm within
 * the drug class.
 * @returns A responsive table rendering algorithm scores per drug.
 */
export default function AlgDrugClassComparison({
  drugScores
}: AlgDrugClassComparisonProps) {
  const container = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  React.useEffect(() => {
    const resize = () => {
      const newContainerWidth = container.current?.offsetWidth ?? 0;
      if (newContainerWidth !== containerWidth) {
        setContainerWidth(newContainerWidth);
      }
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [containerWidth]);

  const groupedDrugScores = React.useMemo(
    () =>
      Array.from(
        drugScores.reduce((map, drugScore) => {
          const drugName = drugScore.drug.name;
          if (!map.has(drugName)) {
            map.set(drugName, [drugScore.drug, new Map<string, DrugScore>()]);
          }
          map.get(drugName)![1].set(drugScore.algorithm, drugScore);
          return map;
        }, new Map<string, [Drug, Map<string, DrugScore>]>() ).values()
      ),
    [drugScores]
  );

  const algorithms = React.useMemo(
    () =>
      Array.from(
        groupedDrugScores.reduce((acc, [, drugScore]) => {
          for (const algorithm of drugScore.keys()) {
            acc.add(algorithm);
          }
          return acc;
        }, new Set<string>())
      ),
    [groupedDrugScores]
  );

  const numAlgs = algorithms.length;

  const allGridsWidth =
    numAlgs < 3 && containerWidth > 1000 ? '100%' : 400 * numAlgs;
  const scrolled = allGridsWidth !== '100%' && allGridsWidth > containerWidth;

  return (
    <div
      ref={container}
      className={style['alg-drugclass-comparison-container']}
    >
      <p className={style.instruction}>
        {scrolled ? (
          <span>
            Scroll right for more <FaAngleDoubleRight />
          </span>
        ) : (
          '\xa0'
        )}
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
              let prevSIR: string | undefined;
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
                  {algorithms.map((alg, idx) => {
                    const ds = drugScore.get(alg);
                    return (
                      <td
                        key={idx}
                        className={isDiff ? style['cell-diff'] : undefined}
                      >
                        <div className={style['alg-comparison-card']}>
                          <dl>
                            {ds ? (
                              <>
                                <dt>SIR:</dt>
                                <dd>{ds.SIR}</dd>
                                <dt title="Interpretation">Intrp:</dt>
                                <dd>{ds.interpretation}</dd>
                                <dt title="Explanation">Expln:</dt>
                                <dd>{nl2br(ds.explanation)}</dd>
                              </>
                            ) : (
                              'Drug Score Not Available'
                            )}
                          </dl>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type {AlgDrugClassComparisonProps, Drug, DrugScore} from './types';
