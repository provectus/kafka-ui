import React, { useState } from 'react';
import { ClusterName } from 'redux/interfaces';
import useInterval from 'lib/hooks/useInterval';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { BrokersApi, BrokersLogdirs, Configuration } from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import * as Metrics from 'components/common/Metrics';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchBrokers,
  fetchClusterStats,
  selectStats,
} from 'redux/reducers/brokers/brokersSlice';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import useAppParams from 'lib/hooks/useAppParams';

const apiClientConf = new Configuration(BASE_PARAMS);
export const brokersApiClient = new BrokersApi(apiClientConf);

interface BrokerLogdirState {
  name: string;
  error: string;
  topics: number;
  partitions: number;
}

const translateLogdir = (data: BrokersLogdirs): BrokerLogdirState => {
  const partitionsCount =
    data.topics?.reduce(
      (prevValue, value) => prevValue + (value.partitions?.length || 0),
      0
    ) || 0;

  return {
    name: data.name || '-',
    error: data.error || '-',
    topics: data.topics?.length || 0,
    partitions: partitionsCount,
  };
};

const Broker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName, brokerId } =
    useAppParams<{ clusterName: ClusterName; brokerId: string }>();

  const [logdirs, setLogdirs] = useState<BrokerLogdirState>();
  const { diskUsage, items } = useAppSelector(selectStats);

  const fetchData = async () => {
    const res = await brokersApiClient.getAllBrokersLogdirs({
      clusterName: clusterName as string,
      broker: [Number(brokerId)],
    });
    if (res && res[0]) {
      setLogdirs(translateLogdir(res[0]));
    }

    dispatch(fetchClusterStats(clusterName));
    dispatch(fetchBrokers(clusterName));
  };

  React.useEffect(() => {
    fetchData();
  }, [clusterName, brokerId, dispatch]);

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
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Name" />
            <TableHeaderCell title="Error" />
            <TableHeaderCell title="Topics" />
            <TableHeaderCell title="Partitions" />
          </tr>
        </thead>
        <tbody>
          {!logdirs ? (
            <tr>
              <td colSpan={8}>Log dir data not available</td>
            </tr>
          ) : (
            <tr>
              <td>{logdirs.name}</td>
              <td>{logdirs.error}</td>
              <td>{logdirs.topics}</td>
              <td>{logdirs.partitions}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default Broker;
