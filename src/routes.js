import React from 'react';
import {Route} from 'found';

import Layout from './components/layout';
import SARS2Routes from './views/sars2';

const routes = (
  <Route path="/">
    <Route Component={Layout}>
      {SARS2Routes()}
    </Route>
  </Route>
);

export default routes;
