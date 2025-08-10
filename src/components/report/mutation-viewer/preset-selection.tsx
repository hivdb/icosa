import React from 'react';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';

export interface PresetOption {
  value: string;
  label: React.ReactNode;
}

export interface PresetSelectionProps {
  options: PresetOption[];
  onChange: (value: string) => void;
  value: string;
}

/**
 * Dropdown component used to select a predefined genome view preset.
 *
 * @param props - {@link PresetSelectionProps} configuring the dropdown.
 * @returns Wrapped dropdown allowing preset selection.
 */
const PresetSelection: React.FC<PresetSelectionProps> = ({
  options,
  onChange,
  value: current
}) => {
  const handleChange = React.useCallback(
    ({ value }: { value: string }) => onChange(value),
    [onChange]
  );

  return (
    <label className={style['preset-selection']}>
      <span>Genome View:</span>
      <Dropdown
        value={current}
        placeholder="Choose a genome view..."
        options={options}
        onChange={handleChange}
      />
    </label>
  );
};

export default PresetSelection;
