import React from 'react';
import { chunk } from 'lodash';
import { v4 } from 'uuid';
import * as Metrics from 'components/common/Metrics';
import { Cluster } from 'generated-sources';
import { Tag } from 'components/common/Tag/Tag.styled';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { NavLink } from 'react-router-dom';
import { clusterTopicsPath } from 'lib/paths';
import Switch from 'components/common/Switch/Switch';

import * as S from './ClustersWidget.styled';

interface Props {
  clusters: Cluster[];
  onlineClusters: Cluster[];
  offlineClusters: Cluster[];
}

interface ChunkItem {
  id: string;
  data: Cluster[];
}

const ClustersWidget: React.FC<Props> = ({
  clusters,
  onlineClusters,
  offlineClusters,
}) => {
  const [showOfflineOnly, setShowOfflineOnly] = React.useState<boolean>(false);

  const clusterList: ChunkItem[] = React.useMemo(() => {
    let list = clusters;

    if (showOfflineOnly) {
      list = offlineClusters;
    }

    return chunk(list, 2).map((data) => ({
      id: v4(),
      data,
    }));
  }, [clusters, offlineClusters, showOfflineOnly]);

  const handleSwitch = () => setShowOfflineOnly(!showOfflineOnly);

  return (
    <>
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label={<Tag color="green">Online</Tag>}>
            <span data-testid="onlineCount">{onlineClusters.length}</span>{' '}
            <Metrics.LightText>clusters</Metrics.LightText>
          </Metrics.Indicator>
          <Metrics.Indicator label={<Tag color="gray">Offline</Tag>}>
            <span data-testid="offlineCount">{offlineClusters.length}</span>{' '}
            <Metrics.LightText>clusters</Metrics.LightText>
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <S.SwitchWrapper>
        <Switch
          name="switchRoundedDefault"
          checked={showOfflineOnly}
          onChange={handleSwitch}
        />
        <label>Only offline clusters</label>
      </S.SwitchWrapper>
      {clusterList.map((chunkItem) => (
        <Table key={chunkItem.id} isFullwidth>
          <thead>
            <tr>
              <TableHeaderCell title="Cluster name" />
              <TableHeaderCell title="Version" />
              <TableHeaderCell title="Brokers count" />
              <TableHeaderCell title="Partitions" />
              <TableHeaderCell title="Topics" />
              <TableHeaderCell title="Production" />
              <TableHeaderCell title="Consumption" />
            </tr>
          </thead>
          <tbody>
            {chunkItem.data.map((cluster) => (
              <tr key={cluster.name}>
                <td>
                  {cluster.readOnly && <Tag color="blue">readonly</Tag>}{' '}
                  {cluster.name}
                </td>
                <td>{cluster.version}</td>
                <td>{cluster.brokerCount}</td>
                <td>{cluster.onlinePartitionCount}</td>
                <td>
                  <NavLink to={clusterTopicsPath(cluster.name)}>
                    {cluster.topicCount}
                  </NavLink>
                </td>
                <td>
                  <BytesFormatted value={cluster.bytesInPerSec} />
                </td>
                <td>
                  <BytesFormatted value={cluster.bytesOutPerSec} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ))}
    </>
  );
};

export default ClustersWidget;
