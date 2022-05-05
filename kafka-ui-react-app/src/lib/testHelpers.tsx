import React, { ReactElement } from 'react';
import { MemoryRouter, Route, StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render, RenderOptions, screen } from '@testing-library/react';
import { AnyAction, Store } from 'redux';
import { RootState } from 'redux/interfaces';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from 'redux/reducers';
import mockStoreCreator from 'redux/store/configureStore/mockStoreCreator';

interface TestRouterWrapperProps {
  pathname: string;
  urlParams: {
    [key: string]: string;
  };
}

export const TestRouterWrapper: React.FC<TestRouterWrapperProps> = ({
  children,
  pathname,
  urlParams,
}) => (
  <MemoryRouter
    initialEntries={[
      {
        key: 'test',
        pathname: Object.keys(urlParams).reduce(
          (acc, param) => acc.replace(`:${param}`, urlParams[param]),
          pathname
        ),
      },
    ]}
  >
    <Route path={pathname}>{children}</Route>
  </MemoryRouter>
);

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: Store<Partial<RootState>, AnyAction>;
  pathname?: string;
}

export function getByTextContent(textMatch: string | RegExp): HTMLElement {
  return screen.getByText((content, node) => {
    const hasText = (nod: Element) => nod.textContent === textMatch;
    const nodeHasText = hasText(node as Element);
    const childrenDontHaveText = Array.from(node?.children || []).every(
      (child) => !hasText(child)
    );
    return nodeHasText && childrenDontHaveText;
  });
}

const customRender = (
  ui: ReactElement,
  {
    preloadedState,
    store = configureStore<RootState>({
      reducer: rootReducer,
      preloadedState,
    }),
    pathname,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // overrides @testing-library/react render.
  const AllTheProviders: React.FC = ({ children }) => {
    return (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <StaticRouter location={{ pathname }}>{children}</StaticRouter>
        </Provider>
      </ThemeProvider>
    );
  };
  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

export { customRender as render };

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

export const getTypeAndPayload = (store: typeof mockStoreCreator) => {
  return store.getActions().map(({ type, payload }) => ({ type, payload }));
};

export const getAlertActions = (mockStore: typeof mockStoreCreator) =>
  getTypeAndPayload(mockStore).filter((currentAction: AnyAction) =>
    currentAction.type.startsWith('alerts')
  );
