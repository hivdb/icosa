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
import {ApolloProvider} from 'react-apollo';

import 'typeface-source-sans-pro';

import './index.css';
import routes from './routes';
import apolloClient from './apollo';
import * as serviceWorker from './serviceWorker';

const Router = createFarceRouter({
  historyProtocol: new BrowserProtocol(),
  historyMiddlewares: [queryMiddleware],
  routeConfig: makeRouteConfig(routes),
  render: createRender({}),
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <Router resolver={resolver} />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
