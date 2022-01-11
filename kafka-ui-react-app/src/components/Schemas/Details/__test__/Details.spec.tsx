import React from 'react';
import Details from 'components/Schemas/Details/Details';
import { render } from 'lib/testHelpers';
import { Route } from 'react-router';
import { clusterSchemaPath } from 'lib/paths';
import { screen, waitFor } from '@testing-library/dom';
import {
  schemasFulfilledState,
  schemaVersion,
} from 'redux/reducers/schemas/__test__/fixtures';
import fetchMock from 'fetch-mock';

const clusterName = 'testClusterName';
const subject = 'schema7_1';

describe('Details', () => {
  describe('for an initial state', () => {
    it('renders pageloader', () => {
      render(
        <Route path={clusterSchemaPath(':clusterName', ':subject')}>
          <Details />
        </Route>,
        {
          pathname: clusterSchemaPath(clusterName, subject),
          preloadedState: {},
        }
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText(subject)).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Schema')).not.toBeInTheDocument();
      expect(screen.queryByText('Remove Schema')).not.toBeInTheDocument();
    });
  });

  describe('for a loaded scheme', () => {
    beforeEach(() => {
      render(
        <Route path={clusterSchemaPath(':clusterName', ':subject')}>
          <Details />
        </Route>,
        {
          pathname: clusterSchemaPath(clusterName, subject),
          preloadedState: {
            loader: {
              'schemas/fetch': 'fulfilled',
            },
            schemas: schemasFulfilledState,
          },
        }
      );
    });

    it('renders component with shema info', () => {
      expect(screen.getByText('Edit Schema')).toBeInTheDocument();
    });

    it('renders progressbar for versions block', () => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('for a loaded scheme and versions', () => {
    afterEach(() => fetchMock.restore());
    it('renders versions table', async () => {
      const mock = fetchMock.getOnce(
        `/api/clusters/${clusterName}/schemas/${subject}/versions`,
        [schemaVersion]
      );
      render(
        <Route path={clusterSchemaPath(':clusterName', ':subject')}>
          <Details />
        </Route>,
        {
          pathname: clusterSchemaPath(clusterName, subject),
          preloadedState: {
            loader: {
              'schemas/fetch': 'fulfilled',
            },
            schemas: schemasFulfilledState,
          },
        }
      );
      await waitFor(() => expect(mock.called()).toBeTruthy());

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders versions table with 0 items', async () => {
      const mock = fetchMock.getOnce(
        `/api/clusters/${clusterName}/schemas/${subject}/versions`,
        []
      );
      render(
        <Route path={clusterSchemaPath(':clusterName', ':subject')}>
          <Details />
        </Route>,
        {
          pathname: clusterSchemaPath(clusterName, subject),
          preloadedState: {
            loader: {
              'schemas/fetch': 'fulfilled',
            },
            schemas: schemasFulfilledState,
          },
        }
      );
      await waitFor(() => expect(mock.called()).toBeTruthy());

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('No active Schema')).toBeInTheDocument();
    });
  });
});
