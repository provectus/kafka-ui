import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { User } from 'generated-sources';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import Table from 'components/common/NewTable';
import { useConfirm } from 'lib/hooks/useConfirm';
import { useAccounts, useDeleteAccountMutation } from 'lib/hooks/api/accounts';
import { accountEditPath, accountsNewPath } from 'lib/paths';

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { data: accounts, isSuccess } = useAccounts();
  const deleteAccount = useDeleteAccountMutation();

  const handleDelete = (id: number) => {
    confirm('Are you sure you want to remove this account?', async () => {
      await deleteAccount.mutateAsync(id);
    });
  };

  const columns = React.useMemo<ColumnDef<User>[]>(
    () => [
      { header: 'Username', accessorKey: 'username' },
      {
        header: 'Enabled',
        accessorKey: 'enabled',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => (getValue<boolean>() ? 'Yes' : 'No'),
      },
      {
        header: 'Roles',
        accessorKey: 'roles',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => getValue<string[]>().join(', '),
      },
      {
        header: '',
        id: 'actions',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ row }) => (
          <Button
            buttonSize="S"
            buttonType="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original.id);
            }}
          >
            Delete
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <PageHeading text="Accounts">
        <Button buttonType="primary" buttonSize="M" to={accountsNewPath}>
          Create Account
        </Button>
      </PageHeading>
      <Table
        columns={columns}
        data={isSuccess ? accounts : []}
        onRowClick={(row) => navigate(accountEditPath(row.original.id))}
        emptyMessage="No accounts found"
      />
    </>
  );
};

export default Accounts;
