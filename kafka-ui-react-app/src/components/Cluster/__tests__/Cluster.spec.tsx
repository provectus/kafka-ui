import React from 'react';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
import ClusterComponent from 'components/Cluster/Cluster';
import { screen } from '@testing-library/react';
import { render, WithRoute } from 'lib/testHelpers';
import {
  clusterBrokersPath,
  clusterConnectorsPath,
  clusterConnectsPath,
  clusterConsumerGroupsPath,
  clusterKsqlDbPath,
  clusterPath,
  clusterSchemasPath,
  clusterTopicsPath,
} from 'lib/paths';
import { useClusters } from 'lib/hooks/api/clusters';
import { onlineClusterPayload } from 'lib/fixtures/clusters';

const CLusterCompText = {
  Topics: 'Topics',
  Schemas: 'Schemas',
  Connect: 'Connect',
  Brokers: 'Brokers',
  ConsumerGroups: 'ConsumerGroups',
  KsqlDb: 'KsqlDb',
};

jest.mock('components/Topics/Topics', () => () => (
  <div>{CLusterCompText.Topics}</div>
));
jest.mock('components/Schemas/Schemas', () => () => (
  <div>{CLusterCompText.Schemas}</div>
));
jest.mock('components/Connect/Connect', () => () => (
  <div>{CLusterCompText.Connect}</div>
));
jest.mock('components/Brokers/Brokers', () => () => (
  <div>{CLusterCompText.Brokers}</div>
));
jest.mock('components/ConsumerGroups/ConsumerGroups', () => () => (
  <div>{CLusterCompText.ConsumerGroups}</div>
));
jest.mock('components/KsqlDb/KsqlDb', () => () => (
  <div>{CLusterCompText.KsqlDb}</div>
));

jest.mock('lib/hooks/api/clusters', () => ({
  useClusters: jest.fn(),
}));

describe('Cluster', () => {
  const renderComponent = async (pathname: string, payload: Cluster[] = []) => {
    (useClusters as jest.Mock).mockImplementation(() => ({
      data: payload,
    }));
    await render(
      <WithRoute path={`${clusterPath()}/*`}>
        <ClusterComponent />
      </WithRoute>,
      { initialEntries: [pathname] }
    );
  };

  it('renders Brokers', async () => {
    await renderComponent(clusterBrokersPath('second'));
    expect(screen.getByText(CLusterCompText.Brokers)).toBeInTheDocument();
  });
  it('renders Topics', async () => {
    await renderComponent(clusterTopicsPath('second'));
    expect(screen.getByText(CLusterCompText.Topics)).toBeInTheDocument();
  });
  it('renders ConsumerGroups', async () => {
    await renderComponent(clusterConsumerGroupsPath('second'));
    expect(
      screen.getByText(CLusterCompText.ConsumerGroups)
    ).toBeInTheDocument();
  });

  describe('configured features', () => {
    const itCorrectlyHandlesConfiguredSchema = (
      feature: ClusterFeaturesEnum,
      text: string,
      path: string
    ) => {
      it(`renders Schemas if ${feature} is configured`, async () => {
        await renderComponent(path, [
          {
            ...onlineClusterPayload,
            features: [feature],
          },
        ]);
        expect(screen.getByText(text)).toBeInTheDocument();
      });

      it(`does not render Schemas if ${feature} is not configured`, async () => {
        await renderComponent(path, [
          { ...onlineClusterPayload, features: [] },
        ]);
        expect(screen.queryByText(text)).not.toBeInTheDocument();
      });
    };

    itCorrectlyHandlesConfiguredSchema(
      ClusterFeaturesEnum.SCHEMA_REGISTRY,
      CLusterCompText.Schemas,
      clusterSchemasPath(onlineClusterPayload.name)
    );
    itCorrectlyHandlesConfiguredSchema(
      ClusterFeaturesEnum.KAFKA_CONNECT,
      CLusterCompText.Connect,
      clusterConnectsPath(onlineClusterPayload.name)
    );
    itCorrectlyHandlesConfiguredSchema(
      ClusterFeaturesEnum.KAFKA_CONNECT,
      CLusterCompText.Connect,
      clusterConnectorsPath(onlineClusterPayload.name)
    );
    itCorrectlyHandlesConfiguredSchema(
      ClusterFeaturesEnum.KSQL_DB,
      CLusterCompText.KsqlDb,
      clusterKsqlDbPath(onlineClusterPayload.name)
    );
  });
});
