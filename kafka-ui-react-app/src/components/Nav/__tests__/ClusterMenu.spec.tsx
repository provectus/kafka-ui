import React from 'react';
import { screen } from '@testing-library/react';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
import ClusterMenu from 'components/Nav/ClusterMenu';
import userEvent from '@testing-library/user-event';
import { clusterConnectorsPath } from 'lib/paths';
import { render } from 'lib/testHelpers';
import { onlineClusterPayload } from 'lib/fixtures/clusters';

describe('ClusterMenu', () => {
  const setupComponent = (cluster: Cluster, singleMode?: boolean) => (
    <ClusterMenu cluster={cluster} singleMode={singleMode} />
  );
  const getMenuItems = () => screen.getAllByRole('menuitem');
  const getMenuItem = () => screen.getByRole('menuitem');
  const getBrokers = () => screen.getByTitle('Brokers');
  const getTopics = () => screen.getByTitle('Brokers');
  const getConsumers = () => screen.getByTitle('Brokers');
  const getKafkaConnect = () => screen.getByTitle('Kafka Connect');
  const getCluster = () => screen.getByText(onlineClusterPayload.name);

  it('renders cluster menu with default set of features', async () => {
    render(setupComponent(onlineClusterPayload));
    expect(getCluster()).toBeInTheDocument();

    expect(getMenuItems().length).toEqual(1);
    await userEvent.click(getMenuItem());
    expect(getMenuItems().length).toEqual(4);

    expect(getBrokers()).toBeInTheDocument();
    expect(getTopics()).toBeInTheDocument();
    expect(getConsumers()).toBeInTheDocument();
  });
  it('renders cluster menu with correct set of features', async () => {
    render(
      setupComponent({
        ...onlineClusterPayload,
        features: [
          ClusterFeaturesEnum.SCHEMA_REGISTRY,
          ClusterFeaturesEnum.KAFKA_CONNECT,
          ClusterFeaturesEnum.KSQL_DB,
        ],
      })
    );
    expect(getMenuItems().length).toEqual(1);
    await userEvent.click(getMenuItem());
    expect(getMenuItems().length).toEqual(7);

    expect(getBrokers()).toBeInTheDocument();
    expect(getTopics()).toBeInTheDocument();
    expect(getConsumers()).toBeInTheDocument();
    expect(screen.getByTitle('Schema Registry')).toBeInTheDocument();
    expect(getKafkaConnect()).toBeInTheDocument();
    expect(screen.getByTitle('KSQL DB')).toBeInTheDocument();
  });
  it('renders open cluster menu', () => {
    render(setupComponent(onlineClusterPayload, true), {
      initialEntries: [clusterConnectorsPath(onlineClusterPayload.name)],
    });

    expect(getMenuItems().length).toEqual(4);
    expect(getCluster()).toBeInTheDocument();
    expect(getBrokers()).toBeInTheDocument();
    expect(getTopics()).toBeInTheDocument();
    expect(getConsumers()).toBeInTheDocument();
  });
  it('makes Kafka Connect link active', async () => {
    render(
      setupComponent({
        ...onlineClusterPayload,
        features: [ClusterFeaturesEnum.KAFKA_CONNECT],
      }),
      { initialEntries: [clusterConnectorsPath(onlineClusterPayload.name)] }
    );
    expect(getMenuItems().length).toEqual(1);
    await userEvent.click(getMenuItem());
    expect(getMenuItems().length).toEqual(5);

    const kafkaConnect = getKafkaConnect();
    expect(kafkaConnect).toBeInTheDocument();

    expect(getKafkaConnect()).toHaveClass('active');
  });
});
