import React from 'react';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { ClusterId } from 'types';

interface Props {
  clusterId: string;
  isFetched: boolean;
  fetchBrokers: (clusterId: ClusterId) => void;
  fetchBrokerMetrics: (clusterId: ClusterId) => void;
}

const Topics: React.FC<Props> = ({
  clusterId,
  isFetched,
  fetchBrokers,
  fetchBrokerMetrics,
}) => {
  React.useEffect(() => { fetchBrokers(clusterId); }, [fetchBrokers, clusterId]);
  React.useEffect(() => { fetchBrokerMetrics(clusterId); }, [fetchBrokerMetrics, clusterId]);

  if (isFetched) {
    return (
      <div>Brokers of {clusterId}</div>
    );
  }

  return (<PageLoader />);
}

export default Topics;
