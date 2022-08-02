import React from 'react';
import * as Metrics from 'components/common/Metrics';
import { Tag } from 'components/common/Tag/Tag.styled';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { NavLink } from 'react-router-dom';
import { clusterTopicsPath } from 'lib/paths';
import Switch from 'components/common/Switch/Switch';
import { useClusters } from 'lib/hooks/api/clusters';
import { ServerStatus } from 'generated-sources';

import * as S from './ClustersWidget.styled';

const ClustersWidget: React.FC = () => {
  const { data } = useClusters();
  const [showOfflineOnly, setShowOfflineOnly] = React.useState<boolean>(false);

  const config = React.useMemo(() => {
    const clusters = data || [];
    const offlineClusters = clusters.filter(
      ({ status }) => status === ServerStatus.OFFLINE
    );
    return {
      list: showOfflineOnly ? offlineClusters : clusters,
      online: clusters.length - offlineClusters.length,
      offline: offlineClusters.length,
    };
  }, [data, showOfflineOnly]);

  const handleSwitch = () => setShowOfflineOnly(!showOfflineOnly);
  return (
    <>
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label={<Tag color="green">Online</Tag>}>
            <span>{config.online}</span>{' '}
            <Metrics.LightText>clusters</Metrics.LightText>
          </Metrics.Indicator>
          <Metrics.Indicator label={<Tag color="gray">Offline</Tag>}>
            <span>{config.offline}</span>{' '}
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
      <Table isFullwidth>
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
          {config.list.map((cluster) => (
            <tr key={cluster.name}>
              <S.TableCell maxWidth="99px" width="350">
                {cluster.readOnly && <Tag color="blue">readonly</Tag>}{' '}
                {cluster.name}
              </S.TableCell>
              <S.TableCell maxWidth="99px">{cluster.version}</S.TableCell>
              <S.TableCell maxWidth="99px">{cluster.brokerCount}</S.TableCell>
              <S.TableCell maxWidth="78px">
                {cluster.onlinePartitionCount}
              </S.TableCell>
              <S.TableCell maxWidth="60px">
                <NavLink to={clusterTopicsPath(cluster.name)}>
                  {cluster.topicCount}
                </NavLink>
              </S.TableCell>
              <S.TableCell maxWidth="85px">
                <BytesFormatted value={cluster.bytesInPerSec} />
              </S.TableCell>
              <S.TableCell maxWidth="85px">
                <BytesFormatted value={cluster.bytesOutPerSec} />
              </S.TableCell>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default ClustersWidget;
