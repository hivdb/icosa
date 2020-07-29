import React from 'react';
import {Route} from 'found';

import Layout from './components/layout';
import SARS2Routes from './views/sars2';
import MutAnnotEditorRoutes from './views/mut-annot-editor';
import config from './config';

const routes = (
  <Route path="/">
    <Route Component={Layout}>
      {SARS2Routes()}
      {MutAnnotEditorRoutes(config.mutAnnotEditor)}
    </Route>
  </Route>
);

export default routes;
