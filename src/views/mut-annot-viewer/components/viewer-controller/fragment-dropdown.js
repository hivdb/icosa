import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import {fragmentOptionShape} from '../../prop-types';

import style from './style.module.scss';


FragmentDropdown.propTypes = {
  fragmentOptions: PropTypes.arrayOf(
    fragmentOptionShape.isRequired
  ).isRequired,
  seqFragment: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  onChange: PropTypes.func.isRequired
};

export default function FragmentDropdown({
  fragmentOptions,
  seqFragment,
  onChange
}) {
  const options = React.useMemo(
    () => fragmentOptions.map(({name, seqFragment}) => ({
      value: name,
      label: `${name} (${seqFragment.join('-')})`
    })),
    [fragmentOptions]
  );

  const curValue = React.useMemo(
    () => {
      const [posStart, posEnd] = seqFragment;
      return fragmentOptions.find(({seqFragment: [s, e]}) => (
        s === posStart && e === posEnd
      )).name;
    },
    [fragmentOptions, seqFragment]
  );

  const handleChange = React.useCallback(
    ({value}) => onChange(value),
    [onChange]
  );

  return (
    <div className={style['input-group']}>
      <h3>Select a region:</h3>
      <Dropdown
       value={curValue}
       options={options}
       name={`display-region`}
       onChange={handleChange} />
    </div>
  );
}
