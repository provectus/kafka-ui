import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { Alert } from 'redux/interfaces';
import configureStore from 'redux/store/configureStore';
import App, { AppProps } from 'components/App';
import AppContainer from 'components/AppContainer';

const fetchClustersList = jest.fn();
const store = configureStore();

describe('App', () => {
  describe('container', () => {
    it('renders view', () => {
      const wrapper = mount(
        <Provider store={store}>
          <StaticRouter>
            <AppContainer />
          </StaticRouter>
        </Provider>
      );
      expect(wrapper.exists('App')).toBeTruthy();
    });
  });
  describe('view', () => {
    const setupComponent = (props: Partial<AppProps> = {}) => (
      <Provider store={store}>
        <StaticRouter>
          <App
            isClusterListFetched
            alerts={[]}
            clusters={[]}
            fetchClustersList={fetchClustersList}
            {...props}
          />
        </StaticRouter>
      </Provider>
    );

    it('handles fetchClustersList', () => {
      const wrapper = mount(setupComponent());
      expect(wrapper.exists()).toBeTruthy();
      expect(fetchClustersList).toHaveBeenCalledTimes(1);
    });

    it('shows PageLoader until cluster list is fetched', () => {
      let component = mount(setupComponent({ isClusterListFetched: false }));
      expect(component.exists('.Layout__container PageLoader')).toBeTruthy();
      expect(component.exists('.Layout__container Switch')).toBeFalsy();

      component = mount(setupComponent({ isClusterListFetched: true }));
      expect(component.exists('.Layout__container PageLoader')).toBeFalsy();
      expect(component.exists('.Layout__container Switch')).toBeTruthy();
    });

    it('correctly renders alerts', () => {
      const alert: Alert = {
        id: 'alert-id',
        type: 'success',
        title: 'My Custom Title',
        message: 'My Custom Message',
        createdAt: 1234567890,
      };
      let wrapper = mount(setupComponent());
      expect(wrapper.exists('.Layout__alerts')).toBeTruthy();
      expect(wrapper.exists('Alert')).toBeFalsy();

      wrapper = mount(setupComponent({ alerts: [alert] }));
      expect(wrapper.exists('Alert')).toBeTruthy();
      expect(wrapper.find('Alert').length).toEqual(1);
    });

    it('matches snapshot', () => {
      const wrapper = mount(setupComponent());
      expect(wrapper).toMatchSnapshot();
    });
  });
});
