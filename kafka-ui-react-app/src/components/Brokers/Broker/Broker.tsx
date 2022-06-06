import React, { useState } from 'react';
import useInterval from 'lib/hooks/useInterval';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { BrokersApi, Configuration } from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import * as Metrics from 'components/common/Metrics';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchBrokers,
  fetchClusterStats,
  selectStats,
} from 'redux/reducers/brokers/brokersSlice';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import useAppParams from 'lib/hooks/useAppParams';
import { translateLogdir } from 'components/Brokers/utils/translateLogdir';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import { TableColumn } from 'components/common/SmartTable/TableColumn';
import { useTableState } from 'lib/hooks/useTableState';
import { ClusterBrokerParam } from 'lib/paths';

const apiClientConf = new Configuration(BASE_PARAMS);
export const brokersApiClient = new BrokersApi(apiClientConf);

export interface BrokerLogdirState {
  name: string;
  error: string;
  topics: number;
  partitions: number;
}

const Broker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();

  const [logdirs, setLogdirs] = useState<BrokerLogdirState[]>([]);
  const { diskUsage, items } = useAppSelector(selectStats);

  React.useEffect(() => {
    brokersApiClient
      .getAllBrokersLogdirs({
        clusterName,
        broker: [Number(brokerId)],
      })
      .then((res) => {
        if (res && res[0]) {
          setLogdirs([translateLogdir(res[0])]);
        }
      });
    dispatch(fetchClusterStats(clusterName));
    dispatch(fetchBrokers(clusterName));
  }, [clusterName, brokerId, dispatch]);

  const tableState = useTableState<BrokerLogdirState, string>(logdirs, {
    idSelector: (logdir) => logdir.name,
    totalPages: 0,
  });

  const brokerItem = items?.find((item) => item.id === Number(brokerId));
  const brokerDiskUsage = diskUsage?.find(
    (item) => item.brokerId === Number(brokerId)
  );

  useInterval(() => {
    fetchClusterStats(clusterName);
    fetchBrokers(clusterName);
  }, 5000);
  return (
    <>
      <PageHeading text={`Broker ${brokerId}`} />
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="Segment Size">
            <BytesFormatted value={brokerDiskUsage?.segmentSize} />
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Count">
            {brokerDiskUsage?.segmentCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Port">{brokerItem?.port}</Metrics.Indicator>
          <Metrics.Indicator label="Host">{brokerItem?.host}</Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <SmartTable
        tableState={tableState}
        placeholder="Log dir data not available"
        isFullwidth
      >
        <TableColumn title="Name" field="name" />
        <TableColumn title="Error" field="error" />
        <TableColumn title="Topics" field="topics" />
        <TableColumn title="Partitions" field="partitions" />
      </SmartTable>
    </>
  );
};

export default Broker;
