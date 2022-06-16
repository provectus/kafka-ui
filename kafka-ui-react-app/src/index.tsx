import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from 'components/App';
import { store } from 'redux/store';
import 'theme/index.scss';
import 'lib/constants';

const queryClient = new QueryClient();

const container =
  document.getElementById('root') || document.createElement('div');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <BrowserRouter basename={window.basePath || '/'}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </Provider>
);
