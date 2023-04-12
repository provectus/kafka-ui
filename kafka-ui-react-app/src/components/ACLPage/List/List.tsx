import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useTheme } from 'styled-components';
import { Button } from 'components/common/Button/Button';
import PlusIcon from 'components/common/Icons/PlusIcon';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import Search from 'components/common/Search/Search';
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
  KafkaAclOperationEnum,
  KafkaAclPermissionEnum,
  KafkaAclResourceTypeEnum,
} from 'generated-sources';

import * as S from './List.styled';

const rowsMock: KafkaAcl[] = [
  {
    principal: 'User 1',
    resourceType: KafkaAclResourceTypeEnum.TOPIC,
    resourceName: 'topic',
    namePatternType: KafkaAclNamePatternTypeEnum.PREFIXED,
    host: 'host_',
    operation: KafkaAclOperationEnum.CREATE,
    permission: KafkaAclPermissionEnum.ALLOW,
  },
];

const ACList: React.FC = () => {
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const theme = useTheme();
  const { data: aclList } = useAcls(clusterName);
  const { deleteResource } = useDeleteAcl(clusterName);
  const { value: isOpen, toggle } = useBoolean(false);
  const modal = useConfirm();

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
      },
      {
        header: 'Resource',
        accessorKey: 'resourceType',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => (
          <S.EnumCell>{getValue<string>().toLowerCase()}</S.EnumCell>
        ),
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
      },
      {
        header: 'Host',
        accessorKey: 'host',
      },
      {
        header: 'Operation',
        accessorKey: 'operation',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => (
          <S.EnumCell>{getValue<string>().toLowerCase()}</S.EnumCell>
        ),
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
      },
      {
        id: 'delete',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ row }) => {
          return (
            <S.DeleteCell onClick={() => onDeleteClick(row.original)}>
              <DeleteIcon fill={theme.acl.table.deleteIcon} />
            </S.DeleteCell>
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <PageHeading text="Acsess Control List">
        <Button buttonSize="M" buttonType="primary" onClick={toggle}>
          <PlusIcon /> Create ACL
        </Button>
      </PageHeading>
      <ControlPanelWrapper hasInput>
        <Search placeholder="Search" disabled />
      </ControlPanelWrapper>
      <Table
        columns={columns}
        data={rowsMock ?? aclList ?? []}
        emptyMessage="No ACL items found"
      />
      <SlidingSidebar title="Create ACL" open={isOpen} onClose={toggle}>
        <Create onCancel={toggle} clusterName={clusterName} />
      </SlidingSidebar>
    </>
  );
};

export default ACList;
