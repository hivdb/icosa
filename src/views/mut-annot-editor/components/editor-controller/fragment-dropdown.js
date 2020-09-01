import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import {fragmentOptionShape} from '../../prop-types';

import style from './style.module.scss';


export default class FragmentDropdown extends React.Component {

  static propTypes = {
    fragmentOptions: PropTypes.arrayOf(
      fragmentOptionShape.isRequired
    ).isRequired,
    seqFragment: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    onChange: PropTypes.func.isRequired
  }

  get options() {
    const {fragmentOptions} = this.props;
    return fragmentOptions.map(({name, seqFragment}) => ({
      value: name,
      label: `${name} (${seqFragment.join('-')})`
    }));
  }

  get curValue() {
    const {
      fragmentOptions,
      seqFragment: [posStart, posEnd]
    } = this.props;

    return fragmentOptions.find(({seqFragment: [s, e]}) => (
      s === posStart && e === posEnd
    )).name;
  }

  handleChange = ({value}) => {
    const {onChange} = this.props;
    onChange(value);
  }

  render() {
    const {options, curValue} = this;

    return (
      <div className={style['input-group']}>
        <h3>Display region:</h3>
        <Dropdown
         value={curValue}
         options={options}
         name={`display-region`}
         onChange={this.handleChange} />
      </div>
    );
  }
}
