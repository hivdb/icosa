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
    <div className={style['preset-selection']}>
      <label htmlFor="genome-map-preset">Genome View:</label>
      <Dropdown
        value={current}
        placeholder="Choose a genome view..."
        options={options}
        id="genome-map-preset"
        name="genome-map-preset"
        onChange={handleChange}
      />
    </div>
  );
};

export default PresetSelection;
