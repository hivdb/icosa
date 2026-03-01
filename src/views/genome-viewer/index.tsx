import React, {Suspense, lazy} from 'react';
import {Route, RouteRenderArgs} from 'found';
import makeClassNames from 'classnames';
import Loader from '../../components/loader';

import PromiseComponent from '../../utils/promise-component';
import CustomColors from '../../components/custom-colors';
import type {SelectOption} from '../../components/select';
import type {GenomeViewerRoutesProps} from './types';
import style from './style.module.scss';

const PresetSelection = lazy(() => import('./preset-selection'));
const GenomeViewer = lazy(() => import('./viewer'));

/**
 * Defines Found routes and lazy-loaded components for the genome viewer.
 *
 * The root route fetches available presets while the `:name/` route
 * loads a specific preset on demand. All children are wrapped with a
 * suspense boundary and optional custom colors.
 */
export default function GenomeViewerRoutes({
  pathPrefix = 'genome-viewer/',
  indexLoader,
  makePresetLoader,
  colors,
  className
}: GenomeViewerRoutesProps) {
  const wrapperClassName = makeClassNames(style['genome-viewer'], className);

  return (
    <Route path={pathPrefix} Component={wrapper}>
      <Route
        render={({props}: RouteRenderArgs) => {
          const promise = (async () => {
            const {presets} = await indexLoader();
            return {
              options: presets.map(({name, label}): SelectOption => ({ 
                value: name, 
                label: String(label) 
              })),
              className: style['main-preset-selection']
            };
          })();

          return (
            <PromiseComponent
              promise={promise}
              component={PresetSelection}
            />
          );
        }}
      />
        <Route
          path=":name/"
          render={({props, match}: RouteRenderArgs) => {
            if (!props) {
              return null;
            }
            const {
              params: {name}
            } = match;
            const presetLoader = makePresetLoader(name);
            return <GenomeViewer {...props} presetLoader={presetLoader} />;
          }}
        />
    </Route>
  );

  /**
   * Wrapper component that provides color overrides and a suspense fallback.
   */
  function wrapper(props: any) {
    return (
      <Suspense fallback={<Loader />}>
        <CustomColors
          {...props}
          className={wrapperClassName}
          colors={colors}
        />
      </Suspense>
    );
  }
}

