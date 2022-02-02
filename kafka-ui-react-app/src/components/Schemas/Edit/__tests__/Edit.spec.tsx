import React from 'react';
import Edit from 'components/Schemas/Edit/Edit';
import { render } from 'lib/testHelpers';
import { clusterSchemaEditPath } from 'lib/paths';
import {
  schemasInitialState,
  schemaVersion,
} from 'redux/reducers/schemas/__test__/fixtures';
import { Route } from 'react-router';
import { screen, waitFor } from '@testing-library/dom';
import ClusterContext, {
  ContextProps,
  initialValue as contextInitialValue,
} from 'components/contexts/ClusterContext';
import { RootState } from 'redux/interfaces';
import fetchMock from 'fetch-mock';

const clusterName = 'testClusterName';
const schemasAPILatestUrl = `/api/clusters/${clusterName}/schemas/${schemaVersion.subject}/latest`;

const renderComponent = (
  initialState: RootState['schemas'] = schemasInitialState,
  context: ContextProps = contextInitialValue
) => {
  return render(
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
};

describe('Edit', () => {
  afterEach(() => fetchMock.reset());

  describe('fetch failed', () => {
    beforeEach(async () => {
      const schemasAPILatestMock = fetchMock.getOnce(schemasAPILatestUrl, 404);
      renderComponent();
      await waitFor(() => {
        expect(schemasAPILatestMock.called()).toBeTruthy();
      });
    });

    it('renders pageloader', () => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText(schemaVersion.subject)).not.toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });
  });

  describe('fetch success', () => {
    describe('has schema versions', () => {
      beforeEach(async () => {
        const schemasAPILatestMock = fetchMock.getOnce(
          schemasAPILatestUrl,
          schemaVersion
        );

        renderComponent();
        await waitFor(() => {
          expect(schemasAPILatestMock.called()).toBeTruthy();
        });
      });

      it('renders component with schema info', () => {
        expect(screen.getByText('Submit')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });
});
