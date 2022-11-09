import React, { PropsWithChildren, ReactElement, useMemo } from 'react';
import {
  MemoryRouter,
  MemoryRouterProps,
  Route,
  Routes,
} from 'react-router-dom';
import fetchMock from 'fetch-mock';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import {
  render,
  renderHook,
  RenderOptions,
  waitFor,
} from '@testing-library/react';
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
import {
  defaultGlobalSettingsValue,
  GlobalSettingsContext,
} from 'components/contexts/GlobalSettingsContext';
import { RolesAccessContext } from 'components/contexts/RolesAccessContext';

import { RolesType, modifyRolesData } from './rolesHelper';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: Store<Partial<RootState>, AnyAction>;
  initialEntries?: MemoryRouterProps['initialEntries'];
  roles?: RolesType;
}

interface WithRouteProps {
  children: React.ReactNode;
  path: string;
}

export const expectQueryWorks = async (
  mock: fetchMock.FetchMockStatic,
  result: { current: UseQueryResult<unknown, unknown> }
) => {
  await waitFor(() => expect(result.current.isFetched).toBeTruthy());
  expect(mock.calls()).toHaveLength(1);
  expect(result.current.data).toBeDefined();
};

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

export const TestRolesProvider: React.FC<
  PropsWithChildren<{ data?: RolesType }>
> = ({ children, data }) => {
  const roles = useMemo(() => modifyRolesData(data), [data]);

  return (
    <RolesAccessContext.Provider value={roles}>
      {children}
    </RolesAccessContext.Provider>
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
    roles,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // overrides @testing-library/react render.
  const AllTheProviders: React.FC<PropsWithChildren<unknown>> = ({
    children,
  }) => (
    <TestQueryClientProvider>
      <GlobalSettingsContext.Provider value={defaultGlobalSettingsValue}>
        <ThemeProvider theme={theme}>
          <TestRolesProvider data={roles}>
            <ConfirmContextProvider>
              <Provider store={store}>
                <MemoryRouter initialEntries={initialEntries}>
                  <div>
                    {children}
                    <ConfirmationModal />
                  </div>
                </MemoryRouter>
              </Provider>
            </ConfirmContextProvider>
          </TestRolesProvider>
        </ThemeProvider>
      </GlobalSettingsContext.Provider>
    </TestQueryClientProvider>
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
