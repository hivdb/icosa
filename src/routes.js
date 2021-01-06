import React from 'react';
import {Route} from 'found';

import Layout from './components/layout';
import Home from './views/home';
import SARS2Routes from './views/sars2';
import MutAnnotViewerRoutes from './views/mut-annot-viewer';
import MarkdownDebugger from './views/markdown-debugger';
import config from './config';

const routes = (
  <Route path="/">
    <Route Component={Layout}>
      <Route Component={Home} />
      <Route Component={MarkdownDebugger} path="markdown-debugger" />
      {SARS2Routes()}
      {MutAnnotViewerRoutes(config.mutAnnotViewer)}
    </Route>
  </Route>
);

export default routes;
