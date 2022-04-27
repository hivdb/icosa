import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';

DRLevels.propTypes = {
  drugClass: PropTypes.object.isRequired,
  levels: PropTypes.array.isRequired,
  disabledDrugs: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
};

DRLevels.defaultProps = {
  disabledDrugs: []
};


export default function DRLevels({levels, drugClass, disabledDrugs}) {

  const disabledDrugSet = new Set(disabledDrugs);
  return (
    <table className={style['dr-level']}>
      <caption>
        {drugClass.fullName}s
      </caption>
      <tbody>
        {levels.map(({drug, text}, idx) => {
          if (disabledDrugSet.has(drug.name)) {
            return null;
          }
          return <tr key={idx}>
            <th>{drug.fullName} ({drug.displayAbbr})</th>
            <td>{text}</td>
          </tr>;
        })}
      </tbody>
    </table>
  );

}
