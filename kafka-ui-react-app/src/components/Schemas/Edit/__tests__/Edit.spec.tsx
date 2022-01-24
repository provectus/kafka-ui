import React from 'react';
import Edit from 'components/Schemas/Edit/Edit';
import { render } from 'lib/testHelpers';
import { clusterSchemaEditPath } from 'lib/paths';
import {
  schemasFulfilledState,
  schemaVersion,
} from 'redux/reducers/schemas/__test__/fixtures';
import { Route } from 'react-router';
import { screen } from '@testing-library/dom';

const clusterName = 'local';
const { subject } = schemaVersion;

describe('Edit Component', () => {
  describe('schema exists', () => {
    beforeEach(() => {
      render(
        <Route path={clusterSchemaEditPath(':clusterName', ':subject')}>
          <Edit />
        </Route>,
        {
          pathname: clusterSchemaEditPath(clusterName, subject),
          preloadedState: { schemas: schemasFulfilledState },
        }
      );
    });

    it('renders component', () => {
      expect(screen.getByText('Edit schema')).toBeInTheDocument();
    });
  });

  describe('schema does not exist', () => {
    beforeEach(() => {
      render(
        <Route path={clusterSchemaEditPath(':clusterName', ':subject')}>
          <Edit />
        </Route>,
        {
          pathname: clusterSchemaEditPath(clusterName, 'fake'),
          preloadedState: { schemas: schemasFulfilledState },
        }
      );
    });

    it('renders component', () => {
      expect(screen.queryByText('Edit schema')).not.toBeInTheDocument();
    });
  });
});
