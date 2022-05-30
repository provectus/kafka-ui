import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { useParams } from 'react-router-dom';
import { BrokersApi, Configuration } from 'generated-sources';
import { BASE_PARAMS } from 'lib/constants';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';

const apiClientConf = new Configuration(BASE_PARAMS);
export const brokersApiClient = new BrokersApi(apiClientConf);

interface BrokerLogdirState {
  name: string;
  error: string;
  topics: number;
  partitions: number;
}

const BrokerLogdir: React.FC = () => {
  const { clusterName, brokerId } =
    useParams<{ clusterName: ClusterName; brokerId: string }>();
  const [logdirs, setLogdirs] = React.useState<BrokerLogdirState>();

  const fetchData = async () => {
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
  };

  React.useEffect(() => {
    fetchData().then();
  }, [clusterName, brokerId]);

  return (
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
  );
};

export default BrokerLogdir;
