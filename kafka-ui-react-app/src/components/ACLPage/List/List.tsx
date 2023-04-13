import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTheme } from 'styled-components';
// import { Button } from 'components/common/Button/Button';
// import PlusIcon from 'components/common/Icons/PlusIcon';
import PageHeading from 'components/common/PageHeading/PageHeading';
// import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
// import Search from 'components/common/Search/Search';
import Table from 'components/common/NewTable';
import SlidingSidebar from 'components/common/SlidingSidebar';
import Create from 'components/ACLPage/CreateACL/Create';
import DeleteIcon from 'components/common/Icons/DeleteIcon';
import useBoolean from 'lib/hooks/useBoolean';
import { useConfirm } from 'lib/hooks/useConfirm';
import useAppParams from 'lib/hooks/useAppParams';
import { useAcls, useDeleteAcl } from 'lib/hooks/api/acl';
import { ClusterName } from 'redux/interfaces';
import {
  KafkaAcl,
  KafkaAclNamePatternTypeEnum,
  KafkaAclPermissionEnum,
} from 'generated-sources';

import * as S from './List.styled';

const ACList: React.FC = () => {
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const theme = useTheme();
  const { data: aclList } = useAcls(clusterName);
  const { deleteResource } = useDeleteAcl(clusterName);
  const { value: isOpen, toggle } = useBoolean(false);
  const modal = useConfirm(true);

  const [rowId, setRowId] = React.useState<string>('');

  const onDeleteClick = (acl: KafkaAcl | null) => {
    if (acl) {
      modal(
        'Are you sure want to delete this ACL? This action cannot be undone.',
        () => deleteResource(acl)
      );
    }
  };

  const columns = React.useMemo<ColumnDef<KafkaAcl>[]>(
    () => [
      {
        header: 'Principal',
        accessorKey: 'principal',
        size: 257,
      },
      {
        header: 'Resource',
        accessorKey: 'resourceType',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => (
          <S.EnumCell>{getValue<string>().toLowerCase()}</S.EnumCell>
        ),
        size: 145,
      },
      {
        header: 'Pattern',
        accessorKey: 'resourceName',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue, row }) => {
          return (
            <S.PatternCell>
              {getValue<string>()}
              {row.original.namePatternType ===
                KafkaAclNamePatternTypeEnum.PREFIXED && (
                <S.Chip chipType="default">
                  {row.original.namePatternType.toLowerCase()}
                </S.Chip>
              )}
            </S.PatternCell>
          );
        },
        size: 257,
      },
      {
        header: 'Host',
        accessorKey: 'host',
        size: 257,
      },
      {
        header: 'Operation',
        accessorKey: 'operation',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => (
          <S.EnumCell>{getValue<string>().toLowerCase()}</S.EnumCell>
        ),
        size: 121,
      },
      {
        header: 'Permission',
        accessorKey: 'permission',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => (
          <S.Chip
            chipType={
              getValue<string>() === KafkaAclPermissionEnum.ALLOW
                ? 'success'
                : 'danger'
            }
          >
            {getValue<string>().toLowerCase()}
          </S.Chip>
        ),
        size: 111,
      },
      {
        id: 'delete',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ row }) => {
          return (
            <S.DeleteCell onClick={() => onDeleteClick(row.original)}>
              <DeleteIcon
                fill={
                  rowId === row.id ? theme.acl.table.deleteIcon : 'transparent'
                }
              />
            </S.DeleteCell>
          );
        },
        size: 76,
      },
    ],
    [rowId]
  );

  const onRowHover = (value: unknown) => {
    if (value && typeof value === 'object' && 'id' in value) {
      setRowId(value.id as string);
    }
  };

  return (
    <>
      <PageHeading text="Acsess Control List">
        {/* <Button buttonSize="M" buttonType="primary" onClick={toggle}>
          <PlusIcon /> Create ACL
        </Button> */}
      </PageHeading>
      {/* <ControlPanelWrapper hasInput>
        <Search placeholder="Search" />
      </ControlPanelWrapper> */}
      <Table
        columns={columns}
        data={aclList ?? []}
        emptyMessage="No ACL items found"
        onRowHover={onRowHover}
        onMouseLeave={() => setRowId('')}
      />
      <SlidingSidebar title="Create ACL" open={isOpen} onClose={toggle}>
        <Create onCancel={toggle} clusterName={clusterName} />
      </SlidingSidebar>
    </>
  );
};

export default ACList;
