import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import configureStore from 'redux/store/configureStore';
import ClusterContext, {
  ContextProps,
  initialValue,
} from 'components/contexts/ClusterContext';

import ListContainer from '../ListContainer';
import List, { ListProps } from '../List';

const store = configureStore();

describe('Connectors List', () => {
  describe('Container', () => {
    it('renders view with initial state of storage', () => {
      const wrapper = mount(
        <Provider store={store}>
          <StaticRouter>
            <ListContainer />
          </StaticRouter>
        </Provider>
      );

      expect(wrapper.exists(List)).toBeTruthy();
    });
  });

  describe('View', () => {
    const fetchConnects = jest.fn();
    const setupComponent = (
      props: Partial<ListProps> = {},
      contextValue: ContextProps = initialValue
    ) => (
      <StaticRouter>
        <ClusterContext.Provider value={contextValue}>
          <List
            areConnectorsFetching
            areConnectsFetching
            connectors={[]}
            connects={[]}
            fetchConnects={fetchConnects}
            {...props}
          />
        </ClusterContext.Provider>
      </StaticRouter>
    );

    it('renders PageLoader', () => {
      const wrapper = mount(setupComponent({ areConnectorsFetching: true }));
      expect(wrapper.exists('PageLoader')).toBeTruthy();
      expect(wrapper.exists('table')).toBeFalsy();
    });

    it('renders table', () => {
      const wrapper = mount(setupComponent({ areConnectorsFetching: false }));
      expect(wrapper.exists('PageLoader')).toBeFalsy();
      expect(wrapper.exists('table')).toBeTruthy();
    });

    it('handles fetchConnects', () => {
      mount(setupComponent());
      expect(fetchConnects).toHaveBeenCalledTimes(1);
    });

    it('renders actions if cluster is not readonly', () => {
      const wrapper = mount(
        setupComponent({}, { ...initialValue, isReadOnly: false })
      );
      expect(
        wrapper.exists('.level-item.level-right > button.is-primary')
      ).toBeTruthy();
    });

    describe('readonly cluster', () => {
      it('does not render actions if cluster is readonly', () => {
        const wrapper = mount(
          setupComponent({}, { ...initialValue, isReadOnly: true })
        );
        expect(
          wrapper.exists('.level-item.level-right > button.is-primary')
        ).toBeFalsy();
      });
    });
  });
});
