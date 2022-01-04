import React, {Suspense, lazy} from 'react';
import PropTypes from 'prop-types';
import {Route} from 'found';
import makeClassNames from 'classnames';
import Loader from 'react-loader';

import CustomColors from '../../components/custom-colors';

import style from './style.module.scss';

const PresetSelection = lazy(() => import('./preset-selection'));
const MutAnnotViewer = lazy(() => import('./viewer'));


MutAnnotViewerRoutes.propTypes = {
  pathPrefix: PropTypes.string,
  presets: PropTypes.array,
  colors: PropTypes.object,
  className: PropTypes.string,
  refDataLoader: PropTypes.func
};

export default function MutAnnotViewerRoutes({
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
       )} />
    ))}
  </Route>;

  function wrapper(props) {
    return <Suspense fallback={<Loader loaded={false} />}>
      <CustomColors
       {...props}
       className={wrapperClassName}
       colors={colors} />
    </Suspense>;
  }
}
