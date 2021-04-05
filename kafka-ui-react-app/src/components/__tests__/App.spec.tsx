import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import configureStore from 'redux/store/configureStore';
import App, { AppProps } from '../App';

const fetchClustersList = jest.fn();
const store = configureStore();

describe('App', () => {
  const setupComponent = (props: Partial<AppProps> = {}) => (
    <App
      isClusterListFetched
      alerts={[]}
      fetchClustersList={fetchClustersList}
      {...props}
    />
  );

  it('handles fetchClustersList', () => {
    const wrapper = mount(
      <Provider store={store}>
        <StaticRouter>{setupComponent()}</StaticRouter>
      </Provider>
    );
    expect(wrapper.exists()).toBeTruthy();
    expect(fetchClustersList).toHaveBeenCalledTimes(1);
  });

  it('shows PageLoader until cluster list is fetched', () => {
    const component = shallow(setupComponent({ isClusterListFetched: false }));
    expect(component.exists('.Layout__container PageLoader')).toBeTruthy();
    expect(component.exists('.Layout__container Switch')).toBeFalsy();
    component.setProps({ isClusterListFetched: true });
    expect(component.exists('.Layout__container PageLoader')).toBeFalsy();
    expect(component.exists('.Layout__container Switch')).toBeTruthy();
  });

  it('correctly renders alerts', () => {
    const alert = {
      id: 'alert-id',
      type: 'success',
      title: 'My Custom Title',
      message: 'My Custom Message',
      createdAt: 1234567890,
    };
    const wrapper = shallow(setupComponent());
    expect(wrapper.exists('.Layout__alerts')).toBeTruthy();
    expect(wrapper.exists('Alert')).toBeFalsy();

    wrapper.setProps({ alerts: [alert] });
    expect(wrapper.exists('Alert')).toBeTruthy();
    expect(wrapper.find('Alert').length).toEqual(1);
  });

  it('matches snapshot', () => {
    const component = shallow(setupComponent());
    expect(component).toMatchSnapshot();
  });
});
