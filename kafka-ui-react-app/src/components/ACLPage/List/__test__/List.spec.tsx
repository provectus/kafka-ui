import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import { clusterACLPath } from 'lib/paths';
import ACList from 'components/ACLPage/List/List';
import { useAcls, useDeleteAcl } from 'lib/hooks/api/acl';
import { aclPayload } from 'lib/fixtures/acls';

jest.mock('lib/hooks/api/acl', () => ({
  useAcls: jest.fn(),
  useDeleteAcl: jest.fn(),
}));

describe('ACLList Component', () => {
  const clusterName = 'local';
  const renderComponent = () =>
    render(
      <WithRoute path={clusterACLPath()}>
        <ACList />
      </WithRoute>,
      {
        initialEntries: [clusterACLPath(clusterName)],
      }
    );

  describe('ACLList', () => {
    describe('when the acls are loaded', () => {
      beforeEach(() => {
        (useAcls as jest.Mock).mockImplementation(() => ({
          data: aclPayload,
        }));
        (useDeleteAcl as jest.Mock).mockImplementation(() => ({
          deleteResource: jest.fn(),
        }));
      });

      it('renders', async () => {
        renderComponent();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('row').length).toEqual(2);
      });
    });

    describe('when it has no acls', () => {
      beforeEach(() => {
        (useAcls as jest.Mock).mockImplementation(() => ({
          data: [],
        }));
        (useDeleteAcl as jest.Mock).mockImplementation(() => ({
          deleteResource: jest.fn(),
        }));
      });

      it('renders', async () => {
        renderComponent();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(
          screen.getByRole('row', { name: 'No ACL items found' })
        ).toBeInTheDocument();
      });
    });
  });
});
