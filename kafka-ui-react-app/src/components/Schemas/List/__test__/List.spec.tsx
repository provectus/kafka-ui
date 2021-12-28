import React from 'react';
import List from 'components/Schemas/List/List';
import { render } from 'lib/testHelpers';
import { Route } from 'react-router';
import { clusterSchemaPath, clusterSchemasPath } from 'lib/paths';
import { screen } from '@testing-library/dom';
import {
  schemasFulfilledState,
  schemasInitialState,
} from 'redux/reducers/schemas/__test__/fixtures';

const clusterName = 'testClusterName';
const subject = 'schema7_1';

describe('List', () => {
  it('renders list', () => {
    render(
      <Route path={clusterSchemasPath(':clusterName')}>
        <List />
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
    expect(screen.getByText('MySchemaSubject')).toBeInTheDocument();
    expect(screen.getByText('schema7_1')).toBeInTheDocument();
  });

  it('renders empty table', () => {
    render(
      <Route path={clusterSchemasPath(':clusterName')}>
        <List />
      </Route>,
      {
        pathname: clusterSchemaPath(clusterName, subject),
        preloadedState: {
          loader: {
            'schemas/fetch': 'fulfilled',
          },
          schemas: schemasInitialState,
        },
      }
    );
    expect(screen.getByText('No schemas found')).toBeInTheDocument();
  });
});
