import React, { useMemo } from 'react';
import PageHeading from 'components/common/PageHeading/PageHeading';
import * as Metrics from 'components/common/Metrics';
import { Tag } from 'components/common/Tag/Tag.styled';
import Switch from 'components/common/Switch/Switch';
import { useClusters } from 'lib/hooks/api/clusters';
import { Cluster, ResourceType, ServerStatus } from 'generated-sources';
import { ColumnDef } from '@tanstack/react-table';
import Table, { SizeCell } from 'components/common/NewTable';
import useBoolean from 'lib/hooks/useBoolean';
import { clusterNewConfigPath } from 'lib/paths';
import { GlobalSettingsContext } from 'components/contexts/GlobalSettingsContext';
import { ActionCanButton } from 'components/common/ActionComponent';
import { useGetUserInfo } from 'lib/hooks/api/roles';

import * as S from './Dashboard.styled';
import ClusterName from './ClusterName';
import ClusterTableActionsCell from './ClusterTableActionsCell';

const Dashboard: React.FC = () => {
  const { data } = useGetUserInfo();
  const clusters = useClusters();
  const { value: showOfflineOnly, toggle } = useBoolean(false);
  const appInfo = React.useContext(GlobalSettingsContext);

  const config = React.useMemo(() => {
    const clusterList = clusters.data || [];
    const offlineClusters = clusterList.filter(
      ({ status }) => status === ServerStatus.OFFLINE
    );
    return {
      list: showOfflineOnly ? offlineClusters : clusterList,
      online: clusterList.length - offlineClusters.length,
      offline: offlineClusters.length,
    };
  }, [clusters, showOfflineOnly]);

  const columns = React.useMemo<ColumnDef<Cluster>[]>(() => {
    const initialColumns: ColumnDef<Cluster>[] = [
      { header: 'Cluster name', accessorKey: 'name', cell: ClusterName },
      { header: 'Version', accessorKey: 'version' },
      { header: 'Brokers count', accessorKey: 'brokerCount' },
      { header: 'Partitions', accessorKey: 'onlinePartitionCount' },
      { header: 'Topics', accessorKey: 'topicCount' },
      { header: 'Production', accessorKey: 'bytesInPerSec', cell: SizeCell },
      { header: 'Consumption', accessorKey: 'bytesOutPerSec', cell: SizeCell },
    ];

    if (appInfo.hasDynamicConfig) {
      initialColumns.push({
        header: '',
        id: 'actions',
        cell: ClusterTableActionsCell,
      });
    }

    return initialColumns;
  }, []);

  const hasPermissions = useMemo(() => {
    if (!data?.rbacEnabled) return true;
    return !!data?.userInfo?.permissions.some(
      (permission) => permission.resource === ResourceType.APPLICATIONCONFIG
    );
  }, [data]);
  return (
    <>
      <PageHeading text="Dashboard" />
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label={<Tag color="green">Online</Tag>}>
            <span>{config.online || 0}</span>{' '}
            <Metrics.LightText>clusters</Metrics.LightText>
          </Metrics.Indicator>
          <Metrics.Indicator label={<Tag color="gray">Offline</Tag>}>
            <span>{config.offline || 0}</span>{' '}
            <Metrics.LightText>clusters</Metrics.LightText>
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <S.Toolbar>
        <div>
          <Switch
            name="switchRoundedDefault"
            checked={showOfflineOnly}
            onChange={toggle}
          />
          <label>Only offline clusters</label>
        </div>
        {appInfo.hasDynamicConfig && (
          <ActionCanButton
            buttonType="primary"
            buttonSize="M"
            to={clusterNewConfigPath}
            canDoAction={hasPermissions}
          >
            Configure new cluster
          </ActionCanButton>
        )}
      </S.Toolbar>
      <Table
        columns={columns}
        data={config?.list}
        enableSorting
        emptyMessage={clusters.isFetched ? 'No clusters found' : 'Loading...'}
      />
    </>
  );
};

export default Dashboard;
