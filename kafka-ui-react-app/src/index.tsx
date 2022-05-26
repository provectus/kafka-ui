import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import * as serviceWorker from 'serviceWorker';
import App from 'components/App';
import { store } from 'redux/store';
import 'theme/index.scss';
import 'lib/constants';

const container =
  document.getElementById('root') || document.createElement('div');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter basename={window.basePath || '/'}>
      <App />
    </BrowserRouter>
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
