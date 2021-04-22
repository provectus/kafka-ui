import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import configureStore from 'redux/store/configureStore';
import { connectorsPayload } from 'redux/reducers/connect/__test__/fixtures';
import ClusterContext, {
  ContextProps,
  initialValue,
} from 'components/contexts/ClusterContext';
import ListContainer from 'components/Connect/List/ListContainer';
import List, { ListProps } from 'components/Connect/List/List';

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
    const fetchConnectors = jest.fn();
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
            fetchConnectors={fetchConnectors}
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

    it('renders connectors list', () => {
      const wrapper = mount(
        setupComponent({
          areConnectorsFetching: false,
          connectors: connectorsPayload,
        })
      );
      expect(wrapper.exists('PageLoader')).toBeFalsy();
      expect(wrapper.exists('table')).toBeTruthy();
      expect(wrapper.find('ListItem').length).toEqual(2);
    });

    it('handles fetchConnects and fetchConnectors', () => {
      mount(setupComponent());
      expect(fetchConnects).toHaveBeenCalledTimes(1);
      expect(fetchConnectors).toHaveBeenCalledTimes(1);
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
