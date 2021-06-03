import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import * as serviceWorker from 'serviceWorker';
import configureStore from 'redux/store/configureStore';
import AppContainer from 'components/AppContainer';
import 'theme/index.scss';
import 'lib/constants';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter basename={window.basePath || '/'}>
      <AppContainer />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
