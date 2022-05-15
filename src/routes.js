import React from 'react';
import {Route} from 'found';

import Layout from './components/layout';
import Home from './views/home';
import SARS2Routes from './views/sars2';
import HIV1Routes from './views/hiv';
import MutAnnotViewerRoutes from './views/mut-annot-viewer';
import GenomeViewerRoutes from './views/genome-viewer';
import NGS2CodFreqDev from './views/ngs2codfreq-dev';
import MarkdownDebugger from './views/markdown-debugger';
import MarkdownDebugger2 from './views/markdown-debugger2';
import DebugRefDataLoader from './components/debug-ref-data-loader';
import SeqReadsThresholdNomogramDebugger from
  './views/seqreads-threshold-nomogram-debugger';
import config from './config';

const routes = (
  <Route path="/">
    <Route Component={Layout}>
      <Route Component={Home} />
      <Route Component={NGS2CodFreqDev} path="ngs2codfreq" />
      <Route Component={MarkdownDebugger} path="markdown-debugger" />
      <Route Component={MarkdownDebugger2} path="markdown-debugger2" />
      <Route
       Component={SeqReadsThresholdNomogramDebugger}
       path="seqreads-threshold-nomogram-debugger" />
      {SARS2Routes({
        config: {refDataLoader: DebugRefDataLoader}
      })}
      {HIV1Routes({
        config: {refDataLoader: DebugRefDataLoader}
      })}
      {HIV1Routes({
        pathPrefix: 'hivca/',
        config: {
          configFromURL: (
            'https://s3-us-west-2.amazonaws.com/cms.hivdb.org/localhost/' +
            'pages/sierra-hivca.json'
          ),
          refDataLoader: DebugRefDataLoader
        }
      })}
      {MutAnnotViewerRoutes(config.mutAnnotViewer)}
      {GenomeViewerRoutes(config.genomeViewer)}
    </Route>
  </Route>
);

export default routes;
