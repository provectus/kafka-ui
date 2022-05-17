import React from 'react';
import New from 'components/Schemas/New/New';
import { render } from 'lib/testHelpers';
import { clusterSchemaNewPath } from 'lib/paths';
import { Route } from 'react-router-dom';
import { screen } from '@testing-library/dom';

const clusterName = 'local';

describe('New Component', () => {
  beforeEach(() => {
    render(
      <Route path={clusterSchemaNewPath(':clusterName')}>
        <New />
      </Route>,
      {
        pathname: clusterSchemaNewPath(clusterName),
      }
    );
  });

  it('renders component', () => {
    expect(screen.getByText('Create new schema')).toBeInTheDocument();
  });
});
