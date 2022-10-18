import React from 'react';
import {createRoot} from 'react-dom/client';
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
import reportWebVitals from './reportWebVitals';
import './index.module.scss';

const Router = createFarceRouter({
  historyProtocol: new BrowserProtocol(),
  historyMiddlewares: [queryMiddleware],
  routeConfig: makeRouteConfig(routes),
  render: createRender({})
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
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Router resolver={resolver} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
