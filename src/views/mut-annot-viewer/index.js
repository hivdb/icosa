import React, {Suspense, lazy} from 'react';
import {Route} from 'found';
import makeClassNames from 'classnames';
import Loader from '../../components/loader';

import CustomColors from '../../components/custom-colors';
import {NewWindowRoute} from '../../components/new-window';

import style from './style.module.scss';

const PresetSelection = lazy(() => import('./preset-selection'));
const MutAnnotViewer = lazy(() => import('./viewer'));
const ViewerFooter = lazy(() => import('./components/viewer-footer'));


export default function mutAnnotViewerRoutes({
  pathPrefix = "mut-annot-viewer/",
  presets = [],
  colors,
  className,
  refDataLoader
} = {}) {
  const wrapperClassName = makeClassNames(style['mut-annot-viewer'], className);

  const presetOptions = presets.map(({name, display}) => ({
    value: name,
    label: display
  }));

  return <Route path={pathPrefix} Component={wrapper}>
    <Route render={({props}) => (
      <PresetSelection {...props} options={presetOptions} />
    )} />
    {presets.map(({name, ...preset}, idx) => (
      <Route
       key={idx} path={`${name}/`} render={({props}) => (
         <MutAnnotViewer
          {...props}
          preset={{name, ...preset}}
          refDataLoader={refDataLoader} />
       )}>
      </Route>
    ))}
    {presets.map(({name}, idx) => (
      <NewWindowRoute
       key={idx}
       pathPrefix={`${name}`}
       overrideProps={{refDataLoader}}
       Component={ViewerFooter} />
    ))}
  </Route>;

  function wrapper(props) {
    return <Suspense fallback={<Loader />}>
      <CustomColors
       {...props}
       className={wrapperClassName}
       colors={colors} />
    </Suspense>;
  }

}
