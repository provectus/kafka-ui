import React, { ReactElement } from 'react';
import { MemoryRouter, Route, StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { store } from 'redux/store';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render, RenderOptions } from '@testing-library/react';

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

export const containerRendersView = (
  container: React.ReactElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  view: React.FC<any>
) => {
  describe('container', () => {
    it('renders view', async () => {
      let wrapper = mount(<div />);
      await act(async () => {
        wrapper = mount(
          <Provider store={store}>
            <StaticRouter>
              <ThemeProvider theme={theme}>{container}</ThemeProvider>
            </StaticRouter>
          </Provider>
        );
      });
      expect(wrapper.exists(view)).toBeTruthy();
    });
  });
};

export function mountWithTheme(child: ReactElement) {
  return mount(child, {
    wrappingComponent: ({ children }) => (
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    ),
  });
}

// overrides @testing-library/react render.
const AllTheProviders: React.FC = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };
