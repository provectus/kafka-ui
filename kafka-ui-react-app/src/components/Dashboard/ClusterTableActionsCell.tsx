import React, { useMemo } from 'react';
import { Cluster, ResourceType } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { clusterConfigPath } from 'lib/paths';
import { useGetUserInfo } from 'lib/hooks/api/roles';
import { ActionCanButton } from 'components/common/ActionComponent';

type Props = CellContext<Cluster, unknown>;

const ClusterTableActionsCell: React.FC<Props> = ({ row }) => {
  const { name } = row.original;
  const { data } = useGetUserInfo();

  const isApplicationConfig = useMemo(() => {
    return (
      data?.userInfo?.permissions.some(
        (permission) => permission.resource === ResourceType.APPLICATIONCONFIG
      ) || false
    );
  }, [data]);

  return (
    <ActionCanButton
      buttonType="secondary"
      buttonSize="S"
      to={clusterConfigPath(name)}
      canDoAction={isApplicationConfig}
    >
      Configure
    </ActionCanButton>
  );
};

export default ClusterTableActionsCell;
