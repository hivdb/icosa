import React from 'react';
import Dropdown from 'react-dropdown';

import type {FragmentOption} from '../../types';

import style from './style.module.scss';

interface FragmentDropdownProps {
  /** Available fragment options. */
  fragmentOptions: FragmentOption[];
  /** Currently selected fragment range. */
  seqFragment: number[];
  /** Callback when a new fragment is chosen. */
  onChange: (fragmentName: string) => void;
}

/**
 * Dropdown control for selecting a sequence fragment region.
 */
export default function FragmentDropdown({
  fragmentOptions,
  seqFragment,
  onChange
}: FragmentDropdownProps) {
  const options = React.useMemo(
    () => fragmentOptions.map(({name, seqFragment}) => ({
      value: name,
      label: `${name} (${seqFragment.join('-')})`
    })),
    [fragmentOptions]
  );

  const curValue = React.useMemo(() => {
    const [posStart, posEnd] = seqFragment;
    const match = fragmentOptions.find(({seqFragment: [s, e]}) => (
      s === posStart && e === posEnd
    ));
    return match ? match.name : fragmentOptions[0]?.name;
  }, [fragmentOptions, seqFragment]);

  const handleChange = React.useCallback(
    ({value}: {value: string}) => onChange(value),
    [onChange]
  );

  return (
    <div className={style['input-group']}>
      <h3>Select a region:</h3>
      <Dropdown
       value={curValue}
       options={options}
       onChange={handleChange} />
    </div>
  );
}
