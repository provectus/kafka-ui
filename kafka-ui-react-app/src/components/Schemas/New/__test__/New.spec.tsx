import React from 'react';
import New from 'components/Schemas/New/New';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterSchemaNewPath } from 'lib/paths';
import { screen } from '@testing-library/dom';

const clusterName = 'local';

describe('New Component', () => {
  beforeEach(() => {
    render(
      <WithRoute path={clusterSchemaNewPath()}>
        <New />
      </WithRoute>,
      {
        initialEntries: [clusterSchemaNewPath(clusterName)],
      }
    );
  });

  it('renders component', () => {
    expect(screen.getByText('Create new schema')).toBeInTheDocument();
  });
});
