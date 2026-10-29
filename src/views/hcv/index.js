import React, {Suspense, lazy} from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'found';
import Loader from '../../components/loader';
import ConfigContext, {useConfigLoader} from '../../utils/config-context';
import defaultConfig from './config';
import style from '../hbv/style.module.scss';

const Forms = lazy(() => import('./forms'));
const PatternReport = lazy(() => import('./report-by-patterns'));
const SequenceReport = lazy(() => import('./report-by-sequences'));

function Layout({children, data: {config}}) {
  const loadConfig = useConfigLoader(config);
  return <Suspense fallback={<Loader />}>
    <div className={style['sierra-webui']}>
      <ConfigContext.Provider value={loadConfig}>
        {children}
      </ConfigContext.Provider>
    </div>
  </Suspense>;
}

Layout.propTypes = {
  children: PropTypes.node,
  data: PropTypes.shape({config: PropTypes.object.isRequired}).isRequired
};

export default function hcvRoutes({
  pathPrefix = 'hcv/',
  config = {}
} = {}) {
  return <Route
   path={pathPrefix}
   data={{config: {...defaultConfig, ...config}}}
   Component={Layout}>
    <Route path="by-patterns/">
      <Route render={({props}) => <Forms {...props} curAnalysis="pattern-analysis" />} />
      <Route path="report/" Component={PatternReport} />
    </Route>
    <Route path="by-sequences/">
      <Route render={({props}) => <Forms {...props} curAnalysis="sequence-analysis" />} />
      <Route path="report/" Component={SequenceReport} />
    </Route>
    <Redirect to={({location: {pathname}}) => (
      `${pathname}${pathname.endsWith('/') ? '' : '/'}by-patterns/`
    )} />
    <Redirect
     from="by-mutations/"
     to={({location: {pathname}}) => (
       pathname.replace(/by-mutations\/?$/, 'by-patterns/')
     )} />
  </Route>;
}
