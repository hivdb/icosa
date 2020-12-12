import React from 'react';
import {Route} from 'found';

import Layout from './components/layout';
import SARS2Routes from './views/sars2';
import MutAnnotViewerRoutes from './views/mut-annot-viewer';
import config from './config';

const routes = (
  <Route path="/">
    <Route Component={Layout}>
      {SARS2Routes()}
      {MutAnnotViewerRoutes(config.mutAnnotViewer)}
    </Route>
  </Route>
);

export default routes;
