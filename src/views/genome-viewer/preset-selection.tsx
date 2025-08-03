import React from 'react';
import classNames from 'classnames';
import Dropdown from 'react-dropdown';
import {useRouter} from 'found';

import style from './style.module.scss';

interface Option {
  value: string;
  label: React.ReactNode;
}

interface PresetSelectionProps {
  className?: string;
  options: Option[];
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
}

/**
 * Renders a dropdown for selecting genome viewer presets and updates the
 * router path when a new preset is chosen.
 *
 * @param className - optional CSS class for the wrapper element
 * @param options - available preset options
 * @param as - element or component type to render as the wrapper
 */
export default function PresetSelection({
  className,
  options,
  as: Component = 'section'
}: PresetSelectionProps) {
  const routerState = useRouter();
  if (!routerState) {
    throw new Error('PresetSelection must be used within a router');
  }
  const {router, match} = routerState;

  // Break the current path into parts so we can swap out the preset segment
  const splittedPathName = React.useMemo(() => {
    let {pathname} = match.location;
    pathname = pathname.replace(/\/$/, '');
    return pathname.split('/');
  }, [match.location]);

  // Determine the currently selected preset from the path
  const current = React.useMemo(() => {
    const presetName = splittedPathName[splittedPathName.length - 1];
    return options.find(({value}) => value === presetName)
      ? presetName
      : null;
  }, [options, splittedPathName]);

  // Swap the preset segment in the path when the user picks a new option
  const handleChange = React.useCallback(
    ({value}: {value: string}) => {
      const presetName = splittedPathName[splittedPathName.length - 1];
      let pathname: string;
      if (options.find(({value: v}) => v === presetName)) {
        pathname = splittedPathName.slice(0, splittedPathName.length - 1).join('/');
      } else {
        pathname = splittedPathName.join('/');
      }
      router.push(`${pathname}/${value}/`);
    },
    [options, router, splittedPathName]
  );

  return React.createElement(
    Component,
    {
      className: classNames(style['preset-selection'], className)
    },
    <Dropdown
      value={current ?? undefined}
      placeholder="Choose a genome view..."
      options={options}
      name="preset"
      onChange={handleChange}
    />
  );
}

