import React from 'react';
import { store } from 'redux/store';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import NewContainer from 'components/Schemas/New/NewContainer';
import New, { NewProps } from 'components/Schemas/New/New';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

describe('New', () => {
  describe('Container', () => {
    it('renders view', () => {
      const component = shallow(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <NewContainer />
          </Provider>
        </ThemeProvider>
      );

      expect(component.exists()).toBeTruthy();
    });
  });

  describe('View', () => {
    const pathname = '/ui/clusters/clusterName/schemas/create-new';

    const setupWrapper = (props: Partial<NewProps> = {}) => (
      <ThemeProvider theme={theme}>
        <StaticRouter location={{ pathname }} context={{}}>
          <New createSchema={jest.fn()} {...props} />
        </StaticRouter>
      </ThemeProvider>
    );

    it('matches snapshot', () => {
      expect(mount(setupWrapper())).toMatchSnapshot();
    });
  });
});
