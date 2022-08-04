import React, { PropsWithChildren, ReactElement } from 'react';
import {
  MemoryRouter,
  MemoryRouterProps,
  Route,
  Routes,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render, renderHook, RenderOptions } from '@testing-library/react';
import { AnyAction, Store } from 'redux';
import { RootState } from 'redux/interfaces';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from 'redux/reducers';
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
} from '@tanstack/react-query';
import { ConfirmContextProvider } from 'components/contexts/ConfirmContext';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: Store<Partial<RootState>, AnyAction>;
  initialEntries?: MemoryRouterProps['initialEntries'];
}

interface WithRouteProps {
  children: React.ReactNode;
  path: string;
}

export const WithRoute: React.FC<WithRouteProps> = ({ children, path }) => {
  return (
    <Routes>
      <Route path={path} element={children} />
    </Routes>
  );
};

export const TestQueryClientProvider: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  // use new QueryClient instance for each test run to avoid issues with cache
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  {
    preloadedState,
    store = configureStore<RootState>({
      reducer: rootReducer,
      preloadedState,
    }),
    initialEntries,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // overrides @testing-library/react render.
  const AllTheProviders: React.FC<PropsWithChildren<unknown>> = ({
    children,
  }) => (
    <ThemeProvider theme={theme}>
      <ConfirmContextProvider>
        <Provider store={store}>
          <TestQueryClientProvider>
            <MemoryRouter initialEntries={initialEntries}>
              <div>
                {children}
                <ConfirmationModal />
              </div>
            </MemoryRouter>
          </TestQueryClientProvider>
        </Provider>
      </ConfirmContextProvider>
    </ThemeProvider>
  );
  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

const customRenderHook = (hook: () => UseQueryResult<unknown, unknown>) =>
  renderHook(hook, { wrapper: TestQueryClientProvider });

export { customRender as render, customRenderHook as renderQueryHook };

export class EventSourceMock {
  url: string;

  close: () => void;

  open: () => void;

  error: () => void;

  onmessage: () => void;

  constructor(url: string) {
    this.url = url;
    this.open = jest.fn();
    this.error = jest.fn();
    this.onmessage = jest.fn();
    this.close = jest.fn();
  }
}
