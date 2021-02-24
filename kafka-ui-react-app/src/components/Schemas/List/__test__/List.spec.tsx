import React from 'react';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
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
    const setupWrapper = (props: Partial<ListProps> = {}) => (
      <List schemas={[]} {...props} />
    );

    describe('without schemas', () => {
      it('renders table heading without ListItem', () => {
        const wrapper = shallow(setupWrapper());
        expect(wrapper.exists('Breadcrumb')).toBeTruthy();
        expect(wrapper.exists('thead')).toBeTruthy();
        expect(wrapper.exists('ListItem')).toBeFalsy();
      });

      it('matches snapshot', () => {
        expect(shallow(setupWrapper())).toMatchSnapshot();
      });
    });

    describe('with schemas', () => {
      const wrapper = shallow(setupWrapper({ schemas }));

      it('renders table heading with ListItem', () => {
        expect(wrapper.exists('Breadcrumb')).toBeTruthy();
        expect(wrapper.exists('thead')).toBeTruthy();
        expect(wrapper.find('ListItem').length).toEqual(3);
      });

      it('matches snapshot', () => {
        expect(shallow(setupWrapper({ schemas }))).toMatchSnapshot();
      });
    });
  });
});
