import React from 'react';
import {Route} from 'found';
import makeClassNames from 'classnames';

import PresetSelection from './preset-selection';
import MutAnnotViewer from './viewer';

import CustomColors from '../../components/custom-colors';

import style from './style.module.scss';


export default function MutAnnotViewerRoutes({
  pathPrefix = "mut-annot-viewer/",
  presets = [],
  colors,
  className
} = {}) {
  const wrapperClassName = makeClassNames(
    style['mut-annot-viewer'], className
  );

  const presetOptions = presets.map(({name, display}) => ({
    value: name,
    label: display
  }));

  return <Route path={pathPrefix} Component={wrapper}>
    <Route render={({props}) => (
      <PresetSelection {...props} options={presetOptions} />
    )} />
    {presets.map(({name, ...preset}, idx) => (
      <Route key={idx} path={`${name}/`} render={({props}) => (
        <MutAnnotViewer {...props} preset={{name, ...preset}} />
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
