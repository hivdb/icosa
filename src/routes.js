import React from 'react';
import {Route} from 'found';

import Layout from './components/layout';
import Home from './views/home';
import SARS2Routes from './views/sars2';
import MutAnnotViewerRoutes from './views/mut-annot-viewer';
import GenomeViewerRoutes from './views/genome-viewer';
import MarkdownDebugger from './views/markdown-debugger';
import MarkdownDebugger2 from './views/markdown-debugger2';
import config from './config';

const routes = (
  <Route path="/">
    <Route Component={Layout}>
      <Route Component={Home} />
      <Route Component={MarkdownDebugger} path="markdown-debugger" />
      <Route Component={MarkdownDebugger2} path="markdown-debugger2" />
      {SARS2Routes()}
      {MutAnnotViewerRoutes(config.mutAnnotViewer)}
      {GenomeViewerRoutes(config.genomeViewer)}
    </Route>
  </Route>
);

export default routes;
