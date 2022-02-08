import React from 'react';
import List from 'components/Schemas/List/List';
import { render } from 'lib/testHelpers';
import { Route } from 'react-router';
import { clusterSchemasPath } from 'lib/paths';
import { screen, waitFor } from '@testing-library/dom';
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

import { schemasPayload, schemasEmptyPayload } from './fixtures';

const clusterName = 'testClusterName';
const schemasAPIUrl = `/api/clusters/${clusterName}/schemas`;
const schemasAPICompabilityUrl = `${schemasAPIUrl}/compatibility`;
const renderComponent = (
  initialState: RootState['schemas'] = schemasInitialState,
  context: ContextProps = contextInitialValue
) =>
  render(
    <Route path={clusterSchemasPath(':clusterName')}>
      <ClusterContext.Provider value={context}>
        <List />
      </ClusterContext.Provider>
    </Route>,
    {
      pathname: clusterSchemasPath(clusterName),
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
      renderComponent();
      await waitFor(() => expect(fetchSchemasMock.called()).toBeTruthy());
      await waitFor(() => expect(fetchCompabilityMock.called()).toBeTruthy());
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
        renderComponent();
        await waitFor(() => expect(fetchSchemasMock.called()).toBeTruthy());
        await waitFor(() => expect(fetchCompabilityMock.called()).toBeTruthy());
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
        renderComponent(schemasFulfilledState);
        await waitFor(() => expect(fetchSchemasMock.called()).toBeTruthy());
        await waitFor(() => expect(fetchCompabilityMock.called()).toBeTruthy());
      });
      it('renders list', () => {
        expect(screen.getByText(schemaVersion1.subject)).toBeInTheDocument();
        expect(screen.getByText(schemaVersion2.subject)).toBeInTheDocument();
      });
    });

    describe('responded with readonly cluster schemas', () => {
      beforeEach(async () => {
        const fetchSchemasMock = fetchMock.getOnce(
          schemasAPIUrl,
          schemasPayload
        );

        renderComponent(schemasFulfilledState, {
          ...contextInitialValue,
          isReadOnly: true,
        });
        await waitFor(() => expect(fetchSchemasMock.called()).toBeTruthy());
      });
      it('does not render Create Schema button', () => {
        expect(screen.queryByText('Create Schema')).not.toBeInTheDocument();
      });
    });
  });
});
