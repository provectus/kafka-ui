import React from 'react';
import { shallow, mount } from 'enzyme';
import Brokers from 'components/Brokers/Brokers';
import { ClusterName } from 'redux/interfaces';
import { StaticRouter } from 'react-router';
import { ClusterStats } from 'generated-sources';

interface Props extends ClusterStats {
  isFetched: boolean;
  fetchClusterStats: (clusterName: ClusterName) => void;
  fetchBrokers: (clusterName: ClusterName) => void;
}

describe('Brokers', () => {
  const pathname = `ui/clusters/local/brokers`;

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
        fetchClusterStats={jest.fn()}
        fetchBrokers={jest.fn()}
        diskUsage={undefined}
        isFetched={false}
        {...props}
      />
    </StaticRouter>
  );

  it('matches snapshot', () => {
    expect(mount(setupEmptyComponent())).toMatchSnapshot();
  });

  it('renders Brokers', () => {
    const component = shallow(setupEmptyComponent());
    expect(component.find('.section')).toBeTruthy();
  });
});
