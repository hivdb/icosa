import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


export default class DRLevels extends React.Component {

  static propTypes = {
    drugClass: PropTypes.object.isRequired,
    levels: PropTypes.array.isRequired,
    disabledDrugs: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  }

  static defaultProps = {
    disabledDrugs: ['NFV']
  }

  render() {
    const {levels, drugClass} = this.props;
    const disabledDrugs = new Set(this.props.disabledDrugs);
    return (
      <table className={style['dr-level']}>
        <caption>
          {drugClass.fullName}s
        </caption>
        <tbody>
          {levels.map(({drug, text}, idx) => {
            if (disabledDrugs.has(drug.name)) {
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
}
