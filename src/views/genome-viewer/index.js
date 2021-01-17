import React from 'react';
import {Route} from 'found';
import makeClassNames from 'classnames';

import PresetSelection from './preset-selection';
import GenomeViewer from './viewer';

import CustomColors from '../../components/custom-colors';
import style from './style.module.scss';


export default function GenomeViewerRoutes({
  pathPrefix = "genome-viewer/",
  presets = [],
  colors,
  className
} = {}) {
  const wrapperClassName = makeClassNames(
    style['genome-viewer'], className
  );

  const presetOptions = presets.map(({name, label}) => ({
    value: name,
    label
  }));

  return <Route path={pathPrefix} Component={wrapper}>
    <Route render={({props}) => (
      <PresetSelection {...props}
       className={style['main-preset-selection']}
       options={presetOptions} />
    )} />
    {presets.map(({name, ...preset}) => (
      <Route
       key={`route-genome-viewer-${name}`}
       path={`${name}/`}
       render={({props}) => (
         <GenomeViewer
          {...props}
          options={presetOptions}
          preset={{name, ...preset}} />
       )} />
    ))}
  </Route>;

  function wrapper(props) {
    return (
      <CustomColors
       {...props}
       className={wrapperClassName}
       colors={colors} />
    );
  }
}
