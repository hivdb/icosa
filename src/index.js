import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserProtocol,
  queryMiddleware
} from 'farce';
import {
  createFarceRouter,
  createRender,
  makeRouteConfig,
  resolver
} from 'found';

import 'typeface-source-sans-pro';

import routes from './routes';
import * as serviceWorker from './serviceWorker';

const Router = createFarceRouter({
  historyProtocol: new BrowserProtocol(),
  historyMiddlewares: [queryMiddleware],
  routeConfig: makeRouteConfig(routes),
  render: createRender({}),
});

/**
 * Be aware of the double rendering side effect caused by StrictMode:
 * https://bit.ly/35g6Fip
 *
 * In a nutshell, the double rendering behavior only happens under
 * development mode. You can temprarily disable the StrictMode to
 * ensure it's the cause of your problem. However, StrictMode helps
 * us locate problems. Don't disable it permanently!
 *
 */
ReactDOM.render(
  <React.StrictMode>
    <Router resolver={resolver} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
