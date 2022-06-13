import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterBrokerParam } from 'lib/paths';
import useClusterStats from 'lib/hooks/useClusterStats';
import useBrokersMetrics from 'lib/hooks/useBrokersMetrics';

const BrokerMetrics: React.FC = () => {
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();

  const { data: clusterStats } = useClusterStats(clusterName);
  const { data: metrics } = useBrokersMetrics(clusterName, Number(brokerId));

  if (!clusterStats) return null;

  return <>{JSON.stringify(metrics)}</>;
};

export default BrokerMetrics;
