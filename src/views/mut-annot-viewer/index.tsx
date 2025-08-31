import React, {Suspense, lazy} from 'react';
import {Route} from 'found';
import makeClassNames from 'classnames';
import Loader from '../../components/loader';
import type {FragmentOption} from './types';

import CustomColors from '../../components/custom-colors';
import {NewWindowRoute} from '../../components/new-window';

import style from './style.module.scss';

const PresetSelection = lazy(() => import('./preset-selection'));
const MutAnnotViewer = lazy(() => import('./viewer'));
const ViewerFooter = lazy(() => import('./components/viewer-footer'));

interface PresetConfig {
  name: string;
  display: React.ReactNode;
  annotationLoader: () => Promise<{refSequence: string} & AnnotationData>;
  [key: string]: any;
}

interface RoutesOptions {
  pathPrefix?: string;
  presets?: PresetConfig[];
  colors?: Record<string, string>;
  className?: string;
  refDataLoader?: () => Promise<any>;
}

interface AnnotationData {
  fragmentOptions: FragmentOption[];
  proteinViews: any[];
  annotCategories: any[];
  annotations: any[];
  positions: any[];
  citations: any[];
  comments: {data: any[]; references: string};
}

/**
 * Generate the route configuration for mutation annotation viewer.
 *
 * @param options - Configuration options such as presets and colors.
 * @returns A {@link Route} element tree used by `found` router.
 */
export default function mutAnnotViewerRoutes({
  pathPrefix = 'mut-annot-viewer/',
  presets = [],
  colors,
  className,
  refDataLoader
}: RoutesOptions = {}): React.ReactElement {
  const wrapperClassName = makeClassNames(style['mut-annot-viewer'], className);

  const presetOptions = presets.map(({name, display}) => ({
    value: name,
    label: display
  }));

  return (
    <Route path={pathPrefix} Component={wrapper}>
      <Route render={({props}) => <PresetSelection {...(props as any)} options={presetOptions} />} />
      {presets.map(({name, ...preset}, idx) => (
        <Route
          key={idx}
          path={`${name}/`}
          render={({props}) => (
            <MutAnnotViewer
              {...(props as any)}
              preset={{name, ...preset} as any}
              refDataLoader={refDataLoader}
            />
          )}
        />
      ))}
      {presets.map(({name}, idx) => (
        <NewWindowRoute
          key={idx}
          pathPrefix={`${name}`}
          overrideProps={{refDataLoader}}
          Component={ViewerFooter}
        />
      ))}
    </Route>
  );

  /**
   * Top-level wrapper applied to all routes ensuring required context providers
   * are in place while data is lazily loaded.
   */
  function wrapper(props: any): React.ReactElement {
    return (
      <Suspense fallback={<Loader />}>
        <CustomColors {...props} className={wrapperClassName} colors={colors} />
      </Suspense>
    );
  }
}
