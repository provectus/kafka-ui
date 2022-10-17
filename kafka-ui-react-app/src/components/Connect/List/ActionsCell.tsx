import React from 'react';
import { FullConnectorInfo } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { ClusterNameRoute } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import { useDeleteConnector } from 'lib/hooks/api/kafkaConnect';
import { useConfirm } from 'lib/hooks/useConfirm';

const ActionsCell: React.FC<CellContext<FullConnectorInfo, unknown>> = ({
  row,
}) => {
  const { connect, name } = row.original;

  const { clusterName } = useAppParams<ClusterNameRoute>();

  const confirm = useConfirm();
  const deleteMutation = useDeleteConnector({
    clusterName,
    connectName: connect,
    connectorName: name,
  });

  const handleDelete = () => {
    confirm(
      <>
        Are you sure want to remove <b>{name}</b> connector?
      </>,
      async () => {
        await deleteMutation.mutateAsync();
      }
    );
  };
  return (
    <Dropdown>
      <DropdownItem onClick={handleDelete} danger>
        Remove Connector
      </DropdownItem>
    </Dropdown>
  );
};

export default ActionsCell;
