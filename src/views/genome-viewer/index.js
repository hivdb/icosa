import React from 'react';
import {Route} from 'found';
import makeClassNames from 'classnames';

import PresetSelection from './preset-selection';
import GenomeViewer from './viewer';

import PromiseComponent from '../../utils/promise-component';
import CustomColors from '../../components/custom-colors';
import style from './style.module.scss';


export default function GenomeViewerRoutes({
  pathPrefix = "genome-viewer/",
  indexLoader,
  makePresetLoader,
  colors,
  className
} = {}) {
  const wrapperClassName = makeClassNames(
    style['genome-viewer'], className
  );

  return <Route path={pathPrefix} Component={wrapper}>
    <Route render={({props}) => {
      const promise = (async () => {
        const {presets} = await indexLoader();
        return {
          options: presets.map(({name, label}) => ({
            value: name,
            label
          })),
          className: style['main-preset-selection']
        };
      })();

      return <PromiseComponent
       promise={promise}
       component={PresetSelection} />;
    }} />
    <Route path=":name/" render={({props}) => {
      const {match: {params: {name}}} = props;
      const presetLoader = makePresetLoader(name);
      return (
        <GenomeViewer
         {...props}
         presetLoader={presetLoader} />
      );
    }} />
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
