import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeModeProvider } from 'components/contexts/ThemeModeContext';
import App from 'components/App';
import { store } from 'redux/store';
import 'lib/constants';
import 'theme/index.scss';

const container =
  document.getElementById('root') || document.createElement('div');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter basename={window.basePath || '/'}>
      <ThemeModeProvider>
        <App />
      </ThemeModeProvider>
    </BrowserRouter>
  </Provider>
);
