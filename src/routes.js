import React from 'react';
import {Route, Redirect} from 'found';

import SeqAnaForms from './views/sars2/forms';
import ReportBySequences from './views/sars2/report-by-sequences';
// import HivdbReportByMutations from './views/hivdb/report-by-mutations';
import ReportBySeqReads from './views/sars2/report-by-reads';
// import PageNotFound from './views/errors/page-not-found';

const routes = (
  <Route path="/">
    <Route>
      <Redirect from="sars2/" to="/sars2/by-sequences/" />
      <Route path="sars2/">
        <Route path="by-sequences/">
          <Route render={({props}) => (
            <SeqAnaForms {...props} species="SARS2" />
          )}/>
          <Route path="report/" render={({props}) => (
            <ReportBySequences {...props} species="SARS2" />
          )}/>
        </Route>
        <Route path="by-reads/">
          <Route render={({props}) => (
            <SeqAnaForms {...props} species="SARS2" />
          )}/>
          <Route path="report/" render={({props}) => (
            <ReportBySeqReads {...props} species="SARS2" />
          )}/>
        </Route>
      </Route>
      {/*<Route path="_error404.html" Component={PageNotFound} />*/}
    </Route>
  </Route>
);

export default routes;
