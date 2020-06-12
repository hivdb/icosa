import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';

const levelHumanStrings = {
  'CRITICAL': 'Critical',
  'SEVERE_WARNING': 'Severe warning',
  'WARNING': 'Warning',
  'NOTE': 'Note'
};

const levelOrders = [
  'CRITICAL', 'SEVERE_WARNING', 'WARNING', 'NOTE'
];

function validationResultCmp(r1, r2) {
  return levelOrders.indexOf(r1.level) - levelOrders.indexOf(r2.level);
}


export default class ValidationReport extends React.Component {

  static propTypes = {
    validationResults: PropTypes.array.isRequired,
    placeholder: PropTypes.string
  }

  render() {
    let {validationResults, placeholder} = this.props;
    validationResults = [...validationResults];
    validationResults.sort(validationResultCmp);
    return (
      <section className={style['validation-report']}>
        {validationResults.length > 0 ?
          <ul>
            {validationResults.map(({level, message}, idx) => (
              <li
               key={idx}
               className={style[
                `level-${level.toLowerCase().replace('_', '-')}`
              ]}>
                <strong>{levelHumanStrings[level]}</strong>: {message}
              </li>
            ))}
          </ul>
         : null}
        {validationResults.length === 0 && placeholder ?
          <div className={style.placeholder}>{placeholder}</div>
          : null}
      </section>
    );
  }

}
