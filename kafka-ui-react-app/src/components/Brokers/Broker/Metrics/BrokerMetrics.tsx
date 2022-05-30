import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { useParams } from 'react-router-dom';
import { BrokersApi, Configuration } from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
export const brokersApiClient = new BrokersApi(apiClientConf);

const BrokerMetrics: React.FC = () => {
  const { clusterName, brokerId } =
    useParams<{ clusterName: ClusterName; brokerId: string }>();

  const fetchData = async () => {
    await brokersApiClient.getBrokersMetrics({
      clusterName,
      id: Number(brokerId),
    });
  };

  React.useEffect(() => {
    fetchData().then();
  }, [fetchData]);

  return <>metrics</>;
};

export default BrokerMetrics;
