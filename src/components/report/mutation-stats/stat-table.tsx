import React from 'react';

import config from '../../../config';
import style from './style.module.scss';

export interface StatTableProps {
  /** Router used to navigate when cutoff is changed. */
  router: { push: (loc: any) => void };
  /** Match object describing current location. */
  match: { location: any };
  /** Currently selected cutoff value. */
  currentCutoff: number;
  /** Total number of positions considered in statistics. */
  numPositions: number;
  /** Dynamic histogram data keyed by column name. */
  [key: string]: any;
}

/**
 * Render the mutation statistics table summarizing counts at various cutoffs.
 *
 * @param props - {@link StatTableProps} describing table content.
 * @returns A table element displaying mutation statistics.
 */
export default function StatTable({
  router,
  match,
  currentCutoff,
  numPositions,
  ...data
}: StatTableProps) {
  const mutationStats = React.useMemo(() => {
    const rows: Array<Record<string, number>> = [];
    let i = 0;
    let breakFlag = false;
    while (i > -1) {
      const row: Record<string, number> = {};
      for (const {name, query} of (config as any).mutStatTableColumns) {
        if (!query) {
          continue;
        }
        const targetData = data[name]?.[i];
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
      i++;
    }
    return rows;
  }, [data]);

  const handleCutoffChange = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? {...newLoc.query} : {};
    newLoc.query.cutoff = parseFloat(event.currentTarget.dataset.cutoff || '0');
    router.push(newLoc);
  };

  const {mutStatTableColumns: cols} = config as any;

  return (
    <table className={style['stat-table']}>
      <thead>
        <tr>
          <th>Mutation detection threshold</th>
          {cols.map(({label, type}: any, idx: number) =>
            type === 'dividingLine' ? (
              <th key={`th-${idx}`} className={style['dividing-line']} />
            ) : (
              <th key={`th-${idx}`}>{label}</th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {mutationStats.map((ms, idx) => (
          <tr
            onDoubleClick={handleCutoffChange}
            data-cutoff={(ms.cutoff / 100).toFixed(3)}
            data-current={Math.abs(ms.cutoff - currentCutoff * 100) < 1e-5}
            key={idx}
          >
            <td>{Number(ms.cutoff.toPrecision(1))}%</td>
            {cols.map(({name, type, formatter = (c: number) => c}: any, cidx: number) =>
              type === 'dividingLine' ? (
                <td key={`td-${idx}-${cidx}`} className={style['dividing-line']} />
              ) : (
                <td key={`td-${idx}-${cidx}`}>{formatter(ms[name], numPositions)}</td>
              )
            )}
          </tr>
        ))}
        <tr className={style.footnote}>
          <td colSpan={8}>
            You can select a different "% cutoff" by double clicking corresponding row.
          </td>
        </tr>
      </tbody>
    </table>
  );
}
