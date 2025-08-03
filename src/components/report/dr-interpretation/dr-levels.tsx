import React from 'react';

import style from './style.module.scss';

interface Level {
  drug: {name: string; fullName: string; displayAbbr: string};
  text: string;
}

interface DrugClass {
  name: string;
  fullName: string;
}

interface DRLevelsProps {
  drugClass: DrugClass;
  levels: Level[];
  disabledDrugs?: string[];
}

/**
 * Display resistance interpretation levels for each drug within a class.
 */
export default function DRLevels({levels, drugClass, disabledDrugs = []}: DRLevelsProps) {
  const disabledDrugSet = new Set(disabledDrugs);
  return (
    <table className={style['dr-level']}>
      <caption>{drugClass.fullName}s</caption>
      <tbody>
        {levels.map(({drug, text}, idx) => {
          if (disabledDrugSet.has(drug.name)) {
            return null;
          }
          return (
            <tr key={idx}>
              <th>
                {drug.fullName} ({drug.displayAbbr})
              </th>
              <td>{text}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
