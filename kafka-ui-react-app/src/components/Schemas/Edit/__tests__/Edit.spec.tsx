import React from 'react';
import Edit from 'components/Schemas/Edit/Edit';
import { render } from 'lib/testHelpers';
import { clusterSchemaEditPath } from 'lib/paths';
import {
  schemasInitialState,
  schemaVersion,
} from 'redux/reducers/schemas/__test__/fixtures';
import { Route } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/dom';
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
    <Route path={clusterSchemaEditPath(':clusterName', ':subject')}>
      <ClusterContext.Provider value={context}>
        <Edit />
      </ClusterContext.Provider>
    </Route>,
    {
      pathname: clusterSchemaEditPath(clusterName, schemaVersion.subject),
      preloadedState: {
        schemas: initialState,
      },
    }
  );

describe('Edit', () => {
  afterEach(() => fetchMock.reset());

  describe('fetch failed', () => {
    it('renders pageloader', async () => {
      const schemasAPILatestMock = fetchMock.getOnce(schemasAPILatestUrl, 404);
      await act(() => {
        renderComponent();
      });
      await waitFor(() => expect(schemasAPILatestMock.called()).toBeTruthy());
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText(schemaVersion.subject)).not.toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });
  });

  describe('fetch success', () => {
    describe('has schema versions', () => {
      it('renders component with schema info', async () => {
        const schemasAPILatestMock = fetchMock.getOnce(
          schemasAPILatestUrl,
          schemaVersion
        );
        await act(() => {
          renderComponent();
        });
        await waitFor(() => expect(schemasAPILatestMock.called()).toBeTruthy());
        expect(screen.getByText('Submit')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });
});
