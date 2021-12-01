import React from 'react';
import { chunk } from 'lodash';
import { v4 } from 'uuid';
import MetricsSection from 'components/common/Metrics/MetricsSection';
import Indicator from 'components/common/Metrics/Indicator';
import { Cluster } from 'generated-sources';
import {
  MetricsLightText,
  StyledMetricsWrapper,
} from 'components/common/Metrics/Metrics.styled';
import TagStyled from 'components/common/Tag/Tag.styled';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { NavLink } from 'react-router-dom';
import { clusterTopicsPath } from 'lib/paths';
import Switch from 'components/common/Switch/Switch';

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
      <StyledMetricsWrapper>
        <MetricsSection>
          <Indicator label={<TagStyled color="green">Online</TagStyled>}>
            <span data-testid="onlineCount">{onlineClusters.length}</span>{' '}
            <MetricsLightText>clusters</MetricsLightText>
          </Indicator>
          <Indicator label={<TagStyled color="gray">Offline</TagStyled>}>
            <span data-testid="offlineCount">{offlineClusters.length}</span>{' '}
            <MetricsLightText>clusters</MetricsLightText>
          </Indicator>
        </MetricsSection>
      </StyledMetricsWrapper>
      <div className="p-4">
        <Switch
          name="switchRoundedDefault"
          checked={showOfflineOnly}
          onChange={handleSwitch}
        />
        <span>Only offline clusters</span>
      </div>
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
                <td>{cluster.name}</td>
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
