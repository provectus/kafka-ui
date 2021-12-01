import React from 'react';
import { StaticRouter } from 'react-router';
import { ThemeProvider } from 'styled-components';
import { render, screen } from '@testing-library/react';
import { Cluster, ClusterFeaturesEnum } from 'generated-sources';
import { onlineClusterPayload } from 'redux/reducers/clusters/__test__/fixtures';
import ClusterMenu from 'components/Nav/ClusterMenu';
import theme from 'theme/theme';
import userEvent from '@testing-library/user-event';
import { clusterConnectorsPath, clusterConnectsPath } from 'lib/paths';

describe('ClusterMenu', () => {
  const setupComponent = (
    cluster: Cluster,
    pathname?: string,
    singleMode?: boolean
  ) => (
    <ThemeProvider theme={theme}>
      <StaticRouter location={{ pathname }} context={{}}>
        <ClusterMenu cluster={cluster} singleMode={singleMode} />
      </StaticRouter>
    </ThemeProvider>
  );

  it('renders cluster menu with default set of features', () => {
    render(setupComponent(onlineClusterPayload));
    expect(screen.getByText(onlineClusterPayload.name)).toBeInTheDocument();

    expect(screen.getAllByRole('listitem').length).toEqual(1);
    userEvent.click(screen.getByRole('listitem'));
    expect(screen.getAllByRole('listitem').length).toEqual(4);

    expect(screen.getByTitle('Brokers')).toBeInTheDocument();
    expect(screen.getByTitle('Topics')).toBeInTheDocument();
    expect(screen.getByTitle('Consumers')).toBeInTheDocument();
  });
  it('renders cluster menu with correct set of features', () => {
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
    expect(screen.getAllByRole('listitem').length).toEqual(1);
    userEvent.click(screen.getByRole('listitem'));
    expect(screen.getAllByRole('listitem').length).toEqual(7);

    expect(screen.getByTitle('Brokers')).toBeInTheDocument();
    expect(screen.getByTitle('Topics')).toBeInTheDocument();
    expect(screen.getByTitle('Consumers')).toBeInTheDocument();
    expect(screen.getByTitle('Schema Registry')).toBeInTheDocument();
    expect(screen.getByTitle('Kafka Connect')).toBeInTheDocument();
    expect(screen.getByTitle('KSQL DB')).toBeInTheDocument();
  });
  it('renders open cluster menu', () => {
    render(
      setupComponent(
        onlineClusterPayload,
        clusterConnectorsPath(onlineClusterPayload.name),
        true
      )
    );

    expect(screen.getAllByRole('listitem').length).toEqual(4);
    expect(screen.getByText(onlineClusterPayload.name)).toBeInTheDocument();
    expect(screen.getByTitle('Brokers')).toBeInTheDocument();
    expect(screen.getByTitle('Topics')).toBeInTheDocument();
    expect(screen.getByTitle('Consumers')).toBeInTheDocument();
  });
  it('makes Kafka Connect link active', () => {
    render(
      setupComponent(
        {
          ...onlineClusterPayload,
          features: [ClusterFeaturesEnum.KAFKA_CONNECT],
        },
        clusterConnectorsPath(onlineClusterPayload.name)
      )
    );
    expect(screen.getAllByRole('listitem').length).toEqual(1);
    userEvent.click(screen.getByRole('listitem'));
    expect(screen.getAllByRole('listitem').length).toEqual(5);

    expect(screen.getByText('Kafka Connect')).toBeInTheDocument();
    expect(screen.getByText('Kafka Connect')).toHaveClass('is-active');
  });
  it('makes Kafka Connect link active', () => {
    render(
      setupComponent(
        {
          ...onlineClusterPayload,
          features: [ClusterFeaturesEnum.KAFKA_CONNECT],
        },
        clusterConnectsPath(onlineClusterPayload.name)
      )
    );
    expect(screen.getAllByRole('listitem').length).toEqual(1);
    userEvent.click(screen.getByRole('listitem'));
    expect(screen.getAllByRole('listitem').length).toEqual(5);

    expect(screen.getByText('Kafka Connect')).toBeInTheDocument();
    expect(screen.getByText('Kafka Connect')).toHaveClass('is-active');
  });
});
