import React, { useState } from 'react';
import { ClusterName } from 'redux/interfaces';
import useInterval from 'lib/hooks/useInterval';
import { useParams } from 'react-router-dom';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { BrokersApi, Configuration } from 'generated-sources';
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

const apiClientConf = new Configuration(BASE_PARAMS);
export const brokersApiClient = new BrokersApi(apiClientConf);

interface BrokerLogdirState {
  name: string;
  error: string;
  topics: number;
  partitions: number;
}

const Broker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName, brokerId } =
    useParams<{ clusterName: ClusterName; brokerId: string }>();
  const [logdirs, setLogdirs] = useState<BrokerLogdirState>();
  const { diskUsage, items } = useAppSelector(selectStats);

  const fetchData = React.useCallback(async () => {
    const res = await brokersApiClient.getAllBrokersLogdirs({
      clusterName,
      broker: [Number(brokerId)],
    });
    if (res && res[0]) {
      const partitionsCount =
        res[0].topics?.reduce(
          (prevValue, value) => prevValue + (value.partitions?.length || 0),
          0
        ) || 0;

      const brokerLogdir = {
        name: res[0].name || '-',
        error: res[0].error || '-',
        topics: res[0].topics?.length || 0,
        partitions: partitionsCount,
      };
      setLogdirs(brokerLogdir);
    }

    dispatch(fetchClusterStats(clusterName));
    dispatch(fetchBrokers(clusterName));
  }, [clusterName, brokerId, dispatch]);

  React.useEffect(() => {
    fetchData().then();
  }, [fetchData]);

  const brokerItem = items?.find(
    (item) => Number(item.id) === Number(brokerId)
  );
  const brokerDiskUsage = diskUsage?.find(
    (item) => Number(item.brokerId) === Number(brokerId)
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
