import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


export default class PresetSelection extends React.Component {

  static propTypes = {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired
      }).isRequired
    ).isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired
  }

  handleChange = ({value}) => {
    this.props.onChange(value);
  }

  render() {
    const {value: current, options} = this.props;
    return <div className={style['preset-selection']}>
      <label htmlFor="genome-map-preset">Genome View:</label>
      <Dropdown
       value={current}
       placeholder="Choose a genome view..."
       options={options}
       id="genome-map-preset"
       name="genome-map-preset"
       onChange={this.handleChange} />
    </div>;
  }

}
