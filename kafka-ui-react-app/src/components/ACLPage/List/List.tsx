import React from 'react';
import { Button } from 'components/common/Button/Button';
import PlusIcon from 'components/common/Icons/PlusIcon';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import Search from 'components/common/Search/Search';
import { useAcls } from 'lib/hooks/api/acl';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterName } from 'redux/interfaces';
import { ColumnDef } from '@tanstack/react-table';
import Table from 'components/common/NewTable';
import useBoolean from 'lib/hooks/useBoolean';
import SlidingSidebar from 'components/common/SlidingSidebar';
import { KafkaAcl } from 'generated-sources';
import Create from 'components/ACLPage/CreateACL/Create';

const ACList: React.FC = () => {
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const { data: aclList } = useAcls(clusterName);
  const { value: isOpen, toggle } = useBoolean(false);

  const columns = React.useMemo<ColumnDef<KafkaAcl>[]>(
    () => [
      {
        header: 'Principal',
        accessorKey: 'principal',
      },
      {
        header: 'Resource',
        accessorKey: 'resourceName',
      },
      {
        header: 'Pattern',
        accessorKey: 'namePatternType',
      },
      {
        header: 'Host',
        accessorKey: 'host',
      },
      {
        header: 'Operation',
        accessorKey: 'operation',
      },
      {
        header: 'Permission',
        accessorKey: 'permission',
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
        <Search placeholder="Search" />
      </ControlPanelWrapper>
      <Table
        columns={columns}
        data={aclList ?? []}
        emptyMessage="No ACL items found"
      />
      <SlidingSidebar title="Create ACL" open={isOpen} onClose={toggle}>
        <Create />
      </SlidingSidebar>
    </>
  );
};

export default ACList;
