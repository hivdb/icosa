import React from 'react';
import {Route} from 'found';
import makeClassNames from 'classnames';

import PresetSelection from './preset-selection';
import GenomeViewer from './viewer';

import CustomColors from '../../components/custom-colors';

import sars2MajorLineagesPreset from './sars2-major-lineages.json';
import sars2OtherLineagesPreset from './sars2-other-lineages.json';
import style from './style.module.scss';


export default function GenomeViewerRoutes({
  pathPrefix = "genome-viewer/",
  presets = [
    sars2MajorLineagesPreset,
    sars2OtherLineagesPreset
  ],
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
      <PresetSelection {...props} options={presetOptions} />
    )} />
    {presets.map(({name, ...preset}) => (
      <Route
       key={`route-genome-viewer-${name}`}
       path={`${name}/`}
       render={({props}) => (
         <GenomeViewer
          {...props}
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
