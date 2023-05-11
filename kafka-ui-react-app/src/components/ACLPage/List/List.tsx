import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTheme } from 'styled-components';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Table from 'components/common/NewTable';
import DeleteIcon from 'components/common/Icons/DeleteIcon';
import { useConfirm } from 'lib/hooks/useConfirm';
import useAppParams from 'lib/hooks/useAppParams';
import { useAcls, useDeleteAcl } from 'lib/hooks/api/acl';
import { ClusterName } from 'redux/interfaces';
import {
  KafkaAcl,
  KafkaAclNamePatternType,
  KafkaAclPermissionEnum,
} from 'generated-sources';

import * as S from './List.styled';

const ACList: React.FC = () => {
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const theme = useTheme();
  const { data: aclList } = useAcls(clusterName);
  const { deleteResource } = useDeleteAcl(clusterName);
  const modal = useConfirm(true);

  const [rowId, setRowId] = React.useState('');

  const onDeleteClick = (acl: KafkaAcl | null) => {
    if (acl) {
      modal('Are you sure want to delete this ACL record?', () =>
        deleteResource(acl)
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
          let chipType;
          if (
            row.original.namePatternType === KafkaAclNamePatternType.PREFIXED
          ) {
            chipType = 'default';
          }

          if (
            row.original.namePatternType === KafkaAclNamePatternType.LITERAL
          ) {
            chipType = 'secondary';
          }
          return (
            <S.PatternCell>
              {getValue<string>()}
              {chipType ? (
                <S.Chip chipType={chipType}>
                  {row.original.namePatternType.toLowerCase()}
                </S.Chip>
              ) : null}
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
      <PageHeading text="Access Control List" />
      <Table
        columns={columns}
        data={aclList ?? []}
        emptyMessage="No ACL items found"
        onRowHover={onRowHover}
        onMouseLeave={() => setRowId('')}
      />
    </>
  );
};

export default ACList;
