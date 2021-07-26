import React from 'react';
import { mount } from 'enzyme';
import Brokers from 'components/Brokers/Brokers';
import { ClusterName } from 'redux/interfaces';
import { StaticRouter } from 'react-router';
import { ClusterStats } from 'generated-sources';

interface Props extends ClusterStats {
  isFetched: boolean;
  fetchClusterStats: (clusterName: ClusterName) => void;
  fetchBrokers: (clusterName: ClusterName) => void;
}

describe('Brokers Component', () => {
  const pathname = `ui/clusters/local/brokers`;

  describe('Brokers Empty', () => {
    const setupEmptyComponent = (props: Partial<Props> = {}) => (
      <StaticRouter location={{ pathname }} context={{}}>
        <Brokers
          brokerCount={0}
          activeControllers={0}
          zooKeeperStatus={0}
          onlinePartitionCount={0}
          offlinePartitionCount={0}
          inSyncReplicasCount={0}
          outOfSyncReplicasCount={0}
          underReplicatedPartitionCount={0}
          version="1"
          fetchClusterStats={jest.fn()}
          fetchBrokers={jest.fn()}
          diskUsage={undefined}
          isFetched={false}
          {...props}
        />
      </StaticRouter>
    );
    it('renders section', () => {
      const component = mount(setupEmptyComponent());
      expect(component.exists('.section')).toBeTruthy();
    });

    it('renders section with is-danger selector', () => {
      const component = mount(setupEmptyComponent());
      expect(component.exists('.is-danger')).toBeTruthy();
    });

    it('matches Brokers Empty snapshot', () => {
      expect(mount(setupEmptyComponent())).toMatchSnapshot();
    });
  });

  describe('Brokers', () => {
    const setupComponent = (props: Partial<Props> = {}) => (
      <StaticRouter location={{ pathname }} context={{}}>
        <Brokers
          brokerCount={1}
          activeControllers={1}
          zooKeeperStatus={1}
          onlinePartitionCount={64}
          offlinePartitionCount={0}
          inSyncReplicasCount={64}
          outOfSyncReplicasCount={0}
          underReplicatedPartitionCount={0}
          version="1"
          fetchClusterStats={jest.fn()}
          fetchBrokers={jest.fn()}
          diskUsage={[
            {
              brokerId: 1,
              segmentCount: 64,
              segmentSize: 60718,
            },
          ]}
          isFetched
          {...props}
        />
      </StaticRouter>
    );

    it('renders section with is-success selector', () => {
      const component = mount(setupComponent());
      expect(component.exists('.is-success')).toBeTruthy();
    });

    it('matches snapshot', () => {
      expect(mount(setupComponent())).toMatchSnapshot();
    });
  });
});
