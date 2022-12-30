import React from 'react';
import Edit from 'components/Schemas/Edit/Edit';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterSchemaEditPath } from 'lib/paths';
import {
  schemasInitialState,
  schemaVersion,
  schemaVersionWithNonAsciiChars,
} from 'redux/reducers/schemas/__test__/fixtures';
import { screen } from '@testing-library/dom';
import ClusterContext, {
  ContextProps,
  initialValue as contextInitialValue,
} from 'components/contexts/ClusterContext';
import { RootState } from 'redux/interfaces';
import fetchMock from 'fetch-mock';
import { act } from '@testing-library/react';

const clusterName = 'testClusterName';
const schemasAPILatestUrl = `/api/clusters/${clusterName}/schemas/${schemaVersion.subject}/latest`;

const renderComponent = (
  initialState: RootState['schemas'] = schemasInitialState,
  context: ContextProps = contextInitialValue
) =>
  render(
    <WithRoute path={clusterSchemaEditPath()}>
      <ClusterContext.Provider value={context}>
        <Edit />
      </ClusterContext.Provider>
    </WithRoute>,
    {
      initialEntries: [
        clusterSchemaEditPath(clusterName, schemaVersion.subject),
      ],
      preloadedState: {
        schemas: initialState,
      },
    }
  );

describe('Edit', () => {
  afterEach(() => fetchMock.reset());

  describe('fetch success', () => {
    describe('has schema versions', () => {
      it('renders component with schema info', async () => {
        fetchMock.getOnce(schemasAPILatestUrl, schemaVersion);
        await act(() => {
          renderComponent();
        });
        expect(fetchMock.called(schemasAPILatestUrl)).toBeTruthy();
        expect(screen.getByText('Submit')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });

  describe('fetch success schema with non ascii characters', () => {
    describe('has schema versions', () => {
      it('renders component with schema info', async () => {
        fetchMock.getOnce(schemasAPILatestUrl, schemaVersionWithNonAsciiChars);
        await act(() => {
          renderComponent();
        });
        expect(fetchMock.called(schemasAPILatestUrl)).toBeTruthy();
        expect(screen.getByText('Submit')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });
});
