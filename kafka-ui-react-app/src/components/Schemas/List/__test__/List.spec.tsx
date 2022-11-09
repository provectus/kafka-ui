import React from 'react';
import List from 'components/Schemas/List/List';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterSchemaPath, clusterSchemasPath } from 'lib/paths';
import { act, screen } from '@testing-library/react';
import {
  schemasFulfilledState,
  schemasInitialState,
  schemaVersion1,
  schemaVersion2,
} from 'redux/reducers/schemas/__test__/fixtures';
import ClusterContext, {
  ContextProps,
  initialValue as contextInitialValue,
} from 'components/contexts/ClusterContext';
import { RootState } from 'redux/interfaces';
import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { usePermission } from 'lib/hooks/usePermission';

import { schemasPayload, schemasEmptyPayload } from './fixtures';

jest.mock('lib/hooks/usePermission', () => ({
  usePermission: jest.fn(),
}));

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

const clusterName = 'testClusterName';
const schemasAPIUrl = `/api/clusters/${clusterName}/schemas?page=1&perPage=25`;
const schemasAPICompabilityUrl = `/api/clusters/${clusterName}/schemas/compatibility`;
const renderComponent = (
  initialState: RootState['schemas'] = schemasInitialState,
  context: ContextProps = contextInitialValue
) =>
  render(
    <WithRoute path={clusterSchemasPath()}>
      <ClusterContext.Provider value={context}>
        <List />
      </ClusterContext.Provider>
    </WithRoute>,
    {
      initialEntries: [clusterSchemasPath(clusterName)],
      preloadedState: {
        schemas: initialState,
      },
    }
  );

describe('List', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  describe('fetch error', () => {
    it('shows progressbar', async () => {
      const fetchSchemasMock = fetchMock.getOnce(schemasAPIUrl, 404);
      const fetchCompabilityMock = fetchMock.getOnce(
        schemasAPICompabilityUrl,
        404
      );
      await act(() => {
        renderComponent();
      });
      expect(fetchSchemasMock.called()).toBeTruthy();
      expect(fetchCompabilityMock.called()).toBeTruthy();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('fetch success', () => {
    describe('responded without schemas', () => {
      beforeEach(async () => {
        const fetchSchemasMock = fetchMock.getOnce(
          schemasAPIUrl,
          schemasEmptyPayload
        );
        const fetchCompabilityMock = fetchMock.getOnce(
          schemasAPICompabilityUrl,
          200
        );
        await act(() => {
          renderComponent();
        });
        expect(fetchSchemasMock.called()).toBeTruthy();
        expect(fetchCompabilityMock.called()).toBeTruthy();
      });
      it('renders empty table', () => {
        expect(screen.getByText('No schemas found')).toBeInTheDocument();
      });
    });
    describe('responded with schemas', () => {
      beforeEach(async () => {
        const fetchSchemasMock = fetchMock.getOnce(
          schemasAPIUrl,
          schemasPayload
        );
        const fetchCompabilityMock = fetchMock.getOnce(
          schemasAPICompabilityUrl,
          200
        );
        await act(() => {
          renderComponent(schemasFulfilledState);
        });
        expect(fetchSchemasMock.called()).toBeTruthy();
        expect(fetchCompabilityMock.called()).toBeTruthy();
      });
      it('renders list', () => {
        expect(screen.getByText(schemaVersion1.subject)).toBeInTheDocument();
        expect(screen.getByText(schemaVersion2.subject)).toBeInTheDocument();
      });
      it('handles onRowClick', async () => {
        const { id, schemaType, subject, version, compatibilityLevel } =
          schemaVersion2;
        const row = screen.getByRole('row', {
          name: `${subject} ${id} ${schemaType} ${version} ${compatibilityLevel}`,
        });
        expect(row).toBeInTheDocument();
        await userEvent.click(row);
        expect(mockedUsedNavigate).toHaveBeenCalledWith(
          clusterSchemaPath(clusterName, subject)
        );
      });
    });

    describe('responded with readonly cluster schemas', () => {
      beforeEach(async () => {
        const fetchSchemasMock = fetchMock.getOnce(
          schemasAPIUrl,
          schemasPayload
        );
        fetchMock.getOnce(schemasAPICompabilityUrl, 200);
        await act(() => {
          renderComponent(schemasFulfilledState, {
            ...contextInitialValue,
            isReadOnly: true,
          });
        });
        expect(fetchSchemasMock.called()).toBeTruthy();
      });
      it('does not render Create Schema button', () => {
        expect(screen.queryByText('Create Schema')).not.toBeInTheDocument();
      });
    });
  });

  describe('Permission', () => {
    it('checks the create Schema button is disable when there is not permission', () => {
      (usePermission as jest.Mock).mockImplementation(() => false);
      renderComponent();
      expect(screen.getByText(/Create Schema/i)).toBeDisabled();
    });

    it('checks the add Schema button is enable when there is permission', () => {
      (usePermission as jest.Mock).mockImplementation(() => true);
      renderComponent();
      expect(screen.getByText(/Create Schema/i)).toBeEnabled();
    });
  });
});
