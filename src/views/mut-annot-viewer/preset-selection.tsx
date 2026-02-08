import {useCallback} from 'react';
import Dropdown from 'react-dropdown';
import type {Match, Router} from 'found';

import style from './style.module.scss';

interface Option {
  value: string;
  label: React.ReactNode;
}

interface PresetSelectionProps {
  match: Match;
  router: Router;
  options: Option[];
}

/**
 * Render the preset selection dropdown for mutation annotation viewer.
 *
 * When a new preset is chosen, the router path is updated to include the
 * selected preset name.
 *
 * @param match - Routing match object containing current location.
 * @param router - Router instance used to navigate to the chosen preset.
 * @param options - Available preset options for selection.
 * @returns A section element containing the dropdown control.
 */
export default function PresetSelection({match: {location}, router, options}: PresetSelectionProps) {
  const handleChange = useCallback(
    ({value}: {value: string}) => router.push(`${location.pathname}${value}/`),
    [router, location]
  );

  return (
    <section className={style['preset-selection']}>
      <Dropdown
        placeholder="Choose a gene to view..."
        options={options}
        onChange={handleChange}
      />
    </section>
  );
}
