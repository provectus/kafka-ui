import React from 'react';
import List from 'components/Schemas/List/List';
import { render } from 'lib/testHelpers';
import { Route } from 'react-router';
import { clusterSchemasPath } from 'lib/paths';
import { screen } from '@testing-library/dom';
import {
  schemasFulfilledState,
  schemasInitialState,
} from 'redux/reducers/schemas/__test__/fixtures';
import ClusterContext, {
  ContextProps,
  initialValue as contextInitialValue,
} from 'components/contexts/ClusterContext';
import { RootState } from 'redux/interfaces';

const clusterName = 'testClusterName';

const renderComponent = (
  initialState: RootState['schemas'] = schemasInitialState,
  context: ContextProps = contextInitialValue
) =>
  render(
    <ClusterContext.Provider value={context}>
      <Route path={clusterSchemasPath(':clusterName')}>
        <List />
      </Route>
    </ClusterContext.Provider>,
    {
      pathname: clusterSchemasPath(clusterName),
      preloadedState: {
        loader: {
          'schemas/fetch': 'fulfilled',
        },
        schemas: initialState,
      },
    }
  );

describe('List', () => {
  it('renders list', () => {
    renderComponent(schemasFulfilledState);
    expect(screen.getByText('MySchemaSubject')).toBeInTheDocument();
    expect(screen.getByText('schema7_1')).toBeInTheDocument();
  });

  it('renders empty table', () => {
    renderComponent();
    expect(screen.getByText('No schemas found')).toBeInTheDocument();
  });

  describe('with readonly cluster', () => {
    it('does not render Create Schema button', () => {
      renderComponent(schemasFulfilledState, {
        ...contextInitialValue,
        isReadOnly: true,
      });

      expect(screen.queryByText('Create Schema')).not.toBeInTheDocument();
    });
  });
});
