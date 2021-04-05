import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import configureStore from 'redux/store/configureStore';
import App from '../App';

describe('App', () => {
  it('handles fetchClustersList', () => {
    const store = configureStore();
    const fetchClustersList = jest.fn();
    mount(
      <Provider store={store}>
        <StaticRouter>
          <App fetchClustersList={fetchClustersList} />
        </StaticRouter>
      </Provider>
    );
    expect(fetchClustersList).toHaveBeenCalledTimes(1);
  });

  it('shows PageLoader until cluster list is fetched', () => {
    const component = shallow(<App fetchClustersList={jest.fn()} />);
    expect(component.exists('.Layout__container PageLoader')).toBeTruthy();
    expect(component.exists('.Layout__container Switch')).toBeFalsy();
    component.setProps({ isClusterListFetched: true });
    expect(component.exists('.Layout__container PageLoader')).toBeFalsy();
    expect(component.exists('.Layout__container Switch')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const component = shallow(<App fetchClustersList={jest.fn()} />);
    expect(component).toMatchSnapshot();
  });
});
