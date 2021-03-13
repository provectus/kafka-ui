import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router';
import configureStore from 'redux/store/configureStore';
import ClusterContext from 'components/contexts/ClusterContext';
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
        <List
          isFetching
          fetchSchemasByClusterName={jest.fn()}
          schemas={[]}
          {...props}
        />
      </StaticRouter>
    );

    describe('Initial state', () => {
      let useEffect: jest.SpyInstance<
        void,
        [effect: React.EffectCallback, deps?: React.DependencyList | undefined]
      >;
      const mockedFn = jest.fn();

      const mockedUseEffect = () => {
        useEffect.mockImplementationOnce(mockedFn);
      };

      beforeEach(() => {
        useEffect = jest.spyOn(React, 'useEffect');
        mockedUseEffect();
      });

      it('should call fetchSchemasByClusterName every render', () => {
        mount(setupWrapper({ fetchSchemasByClusterName: mockedFn }));
        expect(mockedFn).toHaveBeenCalled();
      });
    });

    describe('when fetching', () => {
      it('renders PageLoader', () => {
        const wrapper = mount(setupWrapper({ isFetching: true }));
        expect(wrapper.exists('Breadcrumb')).toBeTruthy();
        expect(wrapper.exists('thead')).toBeFalsy();
        expect(wrapper.exists('ListItem')).toBeFalsy();
        expect(wrapper.exists('PageLoader')).toBeTruthy();
      });
    });

    describe('without schemas', () => {
      it('renders table heading without ListItem', () => {
        const wrapper = mount(setupWrapper({ isFetching: false }));
        expect(wrapper.exists('Breadcrumb')).toBeTruthy();
        expect(wrapper.exists('thead')).toBeTruthy();
        expect(wrapper.exists('ListItem')).toBeFalsy();
      });
    });

    describe('with schemas', () => {
      const wrapper = mount(setupWrapper({ isFetching: false, schemas }));

      it('renders table heading with ListItem', () => {
        expect(wrapper.exists('Breadcrumb')).toBeTruthy();
        expect(wrapper.exists('thead')).toBeTruthy();
        expect(wrapper.find('ListItem').length).toEqual(3);
      });
    });

    describe('with readonly cluster', () => {
      const wrapper = mount(
        <StaticRouter>
          <ClusterContext.Provider value={{ isReadOnly: true }}>
            {setupWrapper({ schemas: [] })}
          </ClusterContext.Provider>
        </StaticRouter>
      );
      it('does not render Create Schema button', () => {
        expect(wrapper.exists('NavLink')).toBeFalsy();
      });
    });
  });
});
