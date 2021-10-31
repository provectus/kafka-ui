import React from 'react';
import { chunk } from 'lodash';
import { v4 } from 'uuid';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';
import { Cluster } from 'generated-sources';
import { MetricsContainerStyled } from 'components/common/Dashboard/MetricsContainer.styled';
import TagStyled from 'components/common/Tag/Tag.styled';
import { Colors } from 'theme/theme';
import StyledTable from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { NavLink } from 'react-router-dom';
import { clusterTopicsPath } from 'lib/paths';

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
    <div>
      <MetricsContainerStyled>
        <MetricsWrapper>
          <Indicator label={<TagStyled text="Online" color="green" />}>
            <span data-testid="onlineCount">{onlineClusters.length}</span>{' '}
            <span
              style={{
                color: Colors.neutral[30],
                fontSize: 14,
              }}
            >
              cluster
            </span>
          </Indicator>
          <Indicator label={<TagStyled text="Offline" color="gray" />}>
            <span data-testid="offlineCount">{offlineClusters.length}</span>{' '}
            <span
              style={{
                color: Colors.neutral[30],
                fontSize: 14,
              }}
            >
              cluster
            </span>
          </Indicator>
        </MetricsWrapper>
      </MetricsContainerStyled>
      <div className="p-4">
        <input
          type="checkbox"
          className="switch is-rounded"
          name="switchRoundedDefault"
          id="switchRoundedDefault"
          checked={showOfflineOnly}
          onChange={handleSwitch}
        />
        <label htmlFor="switchRoundedDefault" />
        <span className="is-size-7">Only offline clusters</span>
      </div>
      {clusterList.map((chunkItem) => (
        <StyledTable key={chunkItem.id} isFullwidth>
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
        </StyledTable>
      ))}
    </div>
  );
};

export default ClustersWidget;
