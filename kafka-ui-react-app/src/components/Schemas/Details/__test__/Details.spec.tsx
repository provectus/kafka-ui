import React from 'react';
import Details from 'components/Schemas/Details/Details';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterSchemaPath } from 'lib/paths';
import { screen } from '@testing-library/dom';
import {
  schemasInitialState,
  schemaVersion,
  schemaVersionWithNonAsciiChars,
} from 'redux/reducers/schemas/__test__/fixtures';
import fetchMock from 'fetch-mock';
import ClusterContext, {
  ContextProps,
  initialValue as contextInitialValue,
} from 'components/contexts/ClusterContext';
import { RootState } from 'redux/interfaces';
import { act } from '@testing-library/react';

import { versionPayload, versionEmptyPayload } from './fixtures';

const clusterName = 'testClusterName';
const schemasAPILatestUrl = `/api/clusters/${clusterName}/schemas/${schemaVersion.subject}/latest`;
const schemasAPIVersionsUrl = `/api/clusters/${clusterName}/schemas/${schemaVersion.subject}/versions`;

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockHistoryPush,
}));

const renderComponent = (
  initialState: RootState['schemas'] = schemasInitialState,
  context: ContextProps = contextInitialValue
) =>
  render(
    <WithRoute path={clusterSchemaPath()}>
      <ClusterContext.Provider value={context}>
        <Details />
      </ClusterContext.Provider>
    </WithRoute>,
    {
      initialEntries: [clusterSchemaPath(clusterName, schemaVersion.subject)],
      preloadedState: {
        schemas: initialState,
      },
    }
  );

describe('Details', () => {
  afterEach(() => fetchMock.reset());

  describe('fetch failed', () => {
    it('renders pageloader', async () => {
      const schemasAPILatestMock = fetchMock.getOnce(schemasAPILatestUrl, 404);
      const schemasAPIVersionsMock = fetchMock.getOnce(
        schemasAPIVersionsUrl,
        404
      );
      await act(() => {
        renderComponent();
      });
      expect(schemasAPILatestMock.called(schemasAPILatestUrl)).toBeTruthy();
      expect(schemasAPIVersionsMock.called(schemasAPIVersionsUrl)).toBeTruthy();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText(schemaVersion.subject)).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Schema')).not.toBeInTheDocument();
      expect(screen.queryByText('Remove Schema')).not.toBeInTheDocument();
    });
  });

  describe('fetch success', () => {
    describe('has schema versions', () => {
      it('renders component with schema info', async () => {
        const schemasAPILatestMock = fetchMock.getOnce(
          schemasAPILatestUrl,
          schemaVersion
        );
        const schemasAPIVersionsMock = fetchMock.getOnce(
          schemasAPIVersionsUrl,
          versionPayload
        );
        await act(() => {
          renderComponent();
        });
        expect(schemasAPILatestMock.called()).toBeTruthy();
        expect(schemasAPIVersionsMock.called()).toBeTruthy();
        expect(screen.getByText('Edit Schema')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });

    describe('fetch success schema with non ascii characters', () => {
      describe('has schema versions', () => {
        it('renders component with schema info', async () => {
          const schemasAPILatestMock = fetchMock.getOnce(
            schemasAPILatestUrl,
            schemaVersionWithNonAsciiChars
          );
          const schemasAPIVersionsMock = fetchMock.getOnce(
            schemasAPIVersionsUrl,
            versionPayload
          );
          await act(() => {
            renderComponent();
          });
          expect(schemasAPILatestMock.called()).toBeTruthy();
          expect(schemasAPIVersionsMock.called()).toBeTruthy();
          expect(screen.getByText('Edit Schema')).toBeInTheDocument();
          expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
          expect(screen.getByRole('table')).toBeInTheDocument();
        });
      });
    });

    describe('empty schema versions', () => {
      beforeEach(async () => {
        const schemasAPILatestMock = fetchMock.getOnce(
          schemasAPILatestUrl,
          schemaVersion
        );
        const schemasAPIVersionsMock = fetchMock.getOnce(
          schemasAPIVersionsUrl,
          versionEmptyPayload
        );
        await act(() => {
          renderComponent();
        });
        expect(schemasAPILatestMock.called()).toBeTruthy();
        expect(schemasAPIVersionsMock.called()).toBeTruthy();
      });

      // seems like incorrect behaviour
      it('renders versions table with 0 items', () => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });
  });
});
