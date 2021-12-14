import React from 'react';
import { Route, StaticRouter } from 'react-router-dom';
import { ClusterFeaturesEnum } from 'generated-sources';
import { store } from 'redux/store';
import { onlineClusterPayload } from 'redux/reducers/clusters/__test__/fixtures';
import Cluster from 'components/Cluster/Cluster';
import { fetchClusters } from 'redux/reducers/clusters/clustersSlice';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import {
  clusterBrokersPath,
  clusterConnectsPath,
  clusterConsumerGroupsPath,
  clusterKsqlDbPath,
  clusterSchemasPath,
  clusterTopicsPath,
} from 'lib/paths';

jest.mock('components/Topics/Topics', () => () => <div>Topics</div>);
jest.mock('components/Schemas/Schemas', () => () => <div>Schemas</div>);
jest.mock('components/Connect/Connect', () => () => <div>Connect</div>);
jest.mock('components/Connect/Connect', () => () => <div>Connect</div>);
jest.mock('components/Brokers/BrokersContainer', () => () => (
  <div>Brokers</div>
));
jest.mock('components/ConsumerGroups/ConsumerGroups', () => () => (
  <div>ConsumerGroups</div>
));
jest.mock('components/KsqlDb/KsqlDb', () => () => <div>KsqlDb</div>);

describe('Cluster', () => {
  const renderComponent = (pathname: string) =>
    render(
      <StaticRouter location={{ pathname }}>
        <Route path="/ui/clusters/:clusterName">
          <Cluster />
        </Route>
      </StaticRouter>
    );

  it('renders Brokers', () => {
    renderComponent(clusterBrokersPath('second'));
    expect(screen.getByText('Brokers')).toBeInTheDocument();
  });
  it('renders Topics', () => {
    renderComponent(clusterTopicsPath('second'));
    expect(screen.getByText('Topics')).toBeInTheDocument();
  });
  it('renders ConsumerGroups', () => {
    renderComponent(clusterConsumerGroupsPath('second'));
    expect(screen.getByText('ConsumerGroups')).toBeInTheDocument();
  });

  describe('configured features', () => {
    it('does not render Schemas if SCHEMA_REGISTRY is not configured', () => {
      store.dispatch(
        fetchClusters.fulfilled(
          [
            {
              ...onlineClusterPayload,
              features: [],
            },
          ],
          '123'
        )
      );
      renderComponent(clusterSchemasPath('second'));
      expect(screen.queryByText('Schemas')).not.toBeInTheDocument();
    });
    it('renders Schemas if SCHEMA_REGISTRY is configured', async () => {
      store.dispatch(
        fetchClusters.fulfilled(
          [
            {
              ...onlineClusterPayload,
              features: [ClusterFeaturesEnum.SCHEMA_REGISTRY],
            },
          ],
          '123'
        )
      );
      renderComponent(clusterSchemasPath(onlineClusterPayload.name));
      expect(screen.getByText('Schemas')).toBeInTheDocument();
    });
    it('renders Connect if KAFKA_CONNECT is configured', async () => {
      store.dispatch(
        fetchClusters.fulfilled(
          [
            {
              ...onlineClusterPayload,
              features: [ClusterFeaturesEnum.KAFKA_CONNECT],
            },
          ],
          'requestId'
        )
      );
      renderComponent(clusterConnectsPath(onlineClusterPayload.name));
      expect(screen.getByText('Connect')).toBeInTheDocument();
    });
    it('renders KSQL if KSQL_DB is configured', async () => {
      store.dispatch(
        fetchClusters.fulfilled(
          [
            {
              ...onlineClusterPayload,
              features: [ClusterFeaturesEnum.KSQL_DB],
            },
          ],
          'requestId'
        )
      );
      renderComponent(clusterKsqlDbPath(onlineClusterPayload.name));
      expect(screen.getByText('KsqlDb')).toBeInTheDocument();
    });
  });
});
