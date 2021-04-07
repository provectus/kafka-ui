import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { Route, StaticRouter } from 'react-router-dom';
import { ClusterFeaturesEnum } from 'generated-sources';
import { fetchClusterListAction } from 'redux/actions';
import configureStore from 'redux/store/configureStore';
import { onlineClusterPayload } from 'redux/reducers/clusters/__test__/fixtures';
import Cluster from '../Cluster';

const store = configureStore();

jest.mock('components/Topics/Topics', () => 'mock-Topics');
jest.mock('components/Schemas/Schemas', () => 'mock-Schemas');
jest.mock('components/Connect/Connect', () => 'mock-Connect');
jest.mock('components/Brokers/BrokersContainer', () => 'mock-Brokers');
jest.mock(
  'components/ConsumerGroups/ConsumersGroupsContainer',
  () => 'mock-ConsumerGroups'
);

describe('Cluster', () => {
  const setupComponent = (pathname: string) => (
    <Provider store={store}>
      <StaticRouter location={{ pathname }}>
        <Route path="/ui/clusters/:clusterName">
          <Cluster />
        </Route>
      </StaticRouter>
    </Provider>
  );
  it('renders Brokers', () => {
    const wrapper = mount(setupComponent('/ui/clusters/secondLocal/brokers'));
    expect(wrapper.exists('mock-Brokers')).toBeTruthy();
  });
  it('renders Topics', () => {
    const wrapper = mount(setupComponent('/ui/clusters/secondLocal/topics'));
    expect(wrapper.exists('mock-Topics')).toBeTruthy();
  });
  it('renders ConsumerGroups', () => {
    const wrapper = mount(
      setupComponent('/ui/clusters/secondLocal/consumer-groups')
    );
    expect(wrapper.exists('mock-ConsumerGroups')).toBeTruthy();
  });

  describe('configured features', () => {
    it('does not render Schemas if SCHEMA_REGISTRY is not configured', () => {
      const wrapper = mount(setupComponent('/ui/clusters/secondLocal/schemas'));
      expect(wrapper.exists('mock-Schemas')).toBeFalsy();
    });
    it('renders Schemas if SCHEMA_REGISTRY is configured', () => {
      store.dispatch(
        fetchClusterListAction.success([
          {
            ...onlineClusterPayload,
            features: [ClusterFeaturesEnum.SCHEMA_REGISTRY],
          },
        ])
      );
      const wrapper = mount(setupComponent('/ui/clusters/secondLocal/schemas'));
      expect(wrapper.exists('mock-Schemas')).toBeTruthy();
    });
    it('does not render Connect if KAFKA_CONNECT is not configured', () => {
      const wrapper = mount(
        setupComponent('/ui/clusters/secondLocal/connectors')
      );
      expect(wrapper.exists('mock-Connect')).toBeFalsy();
    });
    it('renders Schemas if KAFKA_CONNECT is configured', async () => {
      await store.dispatch(
        fetchClusterListAction.success([
          {
            ...onlineClusterPayload,
            features: [ClusterFeaturesEnum.KAFKA_CONNECT],
          },
        ])
      );
      const wrapper = mount(
        setupComponent('/ui/clusters/secondLocal/connectors')
      );
      expect(wrapper.exists('mock-Connect')).toBeTruthy();
    });
  });
});
