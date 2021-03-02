import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router';
import configureStore from 'redux/store/configureStore';
import ListContainer from '../ListContainer';
import List, { ListProps } from '../List';
import { schemas } from './fixtures';

describe('List', () => {
  describe('Container', () => {
    const store = configureStore();

    it('renders view', () => {
      const component = shallow(
        <Provider store={store}>
          <ListContainer />
        </Provider>
      );

      expect(component.exists()).toBeTruthy();
    });
  });

  describe('View', () => {
    const pathname = `/ui/clusters/clusterName/schemas`;

    const setupWrapper = (props: Partial<ListProps> = {}) => (
      <StaticRouter location={{ pathname }} context={{}}>
        <List schemas={[]} {...props} />
      </StaticRouter>
    );

    describe('without schemas', () => {
      it('renders table heading without ListItem', () => {
        const wrapper = mount(setupWrapper());
        expect(wrapper.exists('Breadcrumb')).toBeTruthy();
        expect(wrapper.exists('thead')).toBeTruthy();
        expect(wrapper.exists('ListItem')).toBeFalsy();
      });
    });

    describe('with schemas', () => {
      const wrapper = mount(setupWrapper({ schemas }));

      it('renders table heading with ListItem', () => {
        expect(wrapper.exists('Breadcrumb')).toBeTruthy();
        expect(wrapper.exists('thead')).toBeTruthy();
        expect(wrapper.find('ListItem').length).toEqual(3);
      });
    });
  });
});
