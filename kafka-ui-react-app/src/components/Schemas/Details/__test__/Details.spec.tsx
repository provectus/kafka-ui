import React from 'react';
import Details from 'components/Schemas/Details/Details';
import { render } from 'lib/testHelpers';
import { Route } from 'react-router';
import { clusterSchemaPath } from 'lib/paths';
import { screen, waitFor } from '@testing-library/dom';
import {
  schemasInitialState,
  schemaVersion,
} from 'redux/reducers/schemas/__test__/fixtures';
import fetchMock from 'fetch-mock';
import ClusterContext, {
  ContextProps,
  initialValue as contextInitialValue,
} from 'components/contexts/ClusterContext';
import { RootState } from 'redux/interfaces';

import { versionPayload, versionEmptyPayload } from './fixtures';

const clusterName = 'testClusterName';
const schemasAPILatestUrl = `/api/clusters/${clusterName}/schemas/${schemaVersion.subject}/latest`;
const schemasAPIVersionsUrl = `/api/clusters/${clusterName}/schemas/${schemaVersion.subject}/versions`;

const renderComponent = (
  initialState: RootState['schemas'] = schemasInitialState,
  context: ContextProps = contextInitialValue
) => {
  return render(
    <Route path={clusterSchemaPath(':clusterName', ':subject')}>
      <ClusterContext.Provider value={context}>
        <Details />
      </ClusterContext.Provider>
    </Route>,
    {
      pathname: clusterSchemaPath(clusterName, schemaVersion.subject),
      preloadedState: {
        schemas: initialState,
      },
    }
  );
};

describe('Details', () => {
  afterEach(() => fetchMock.reset());

  describe('fetch failed', () => {
    beforeEach(async () => {
      const schemasAPILatestMock = fetchMock.getOnce(schemasAPILatestUrl, 404);
      const schemasAPIVersionsMock = fetchMock.getOnce(
        schemasAPIVersionsUrl,
        404
      );
      renderComponent();
      await waitFor(() => {
        expect(schemasAPILatestMock.called()).toBeTruthy();
      });
      await waitFor(() => {
        expect(schemasAPIVersionsMock.called()).toBeTruthy();
      });
    });

    it('renders pageloader', () => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText(schemaVersion.subject)).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Schema')).not.toBeInTheDocument();
      expect(screen.queryByText('Remove Schema')).not.toBeInTheDocument();
    });
  });

  describe('fetch success', () => {
    describe('has schema versions', () => {
      beforeEach(async () => {
        const schemasAPILatestMock = fetchMock.getOnce(
          schemasAPILatestUrl,
          schemaVersion
        );
        const schemasAPIVersionsMock = fetchMock.getOnce(
          schemasAPIVersionsUrl,
          versionPayload
        );
        renderComponent();
        await waitFor(() => {
          expect(schemasAPILatestMock.called()).toBeTruthy();
        });
        await waitFor(() => {
          expect(schemasAPIVersionsMock.called()).toBeTruthy();
        });
      });

      it('renders component with schema info', () => {
        expect(screen.getByText('Edit Schema')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.getByRole('table')).toBeInTheDocument();
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
        renderComponent();
        await waitFor(() => {
          expect(schemasAPILatestMock.called()).toBeTruthy();
        });
        await waitFor(() => {
          expect(schemasAPIVersionsMock.called()).toBeTruthy();
        });
      });

      // seems like incorrect behaviour
      it('renders versions table with 0 items', () => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByText('No active Schema')).toBeInTheDocument();
      });
    });
  });
});
