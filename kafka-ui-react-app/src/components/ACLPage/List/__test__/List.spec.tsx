import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
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

      it('renders ACLList with records', async () => {
        renderComponent();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('row').length).toEqual(4);
      });

      it('shows delete icon on hover', async () => {
        const { container } = renderComponent();
        const [trElement] = screen.getAllByRole('row');
        await userEvent.hover(trElement);
        const deleteElement = container.querySelector('svg');
        expect(deleteElement).not.toHaveStyle({
          fill: 'transparent',
        });
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

      it('renders empty ACLList with message', async () => {
        renderComponent();
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(
          screen.getByRole('row', { name: 'No ACL items found' })
        ).toBeInTheDocument();
      });
    });
  });
});
