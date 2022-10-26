import React from 'react';
import SchemaVersion from 'components/Schemas/Details/SchemaVersion/SchemaVersion';
import { render } from 'lib/testHelpers';
import { SchemaSubject } from 'generated-sources';
import { Row } from '@tanstack/react-table';

import { jsonSchema } from './fixtures';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

export interface Props {
  row: Row<SchemaSubject>;
}

const renderComponent = () => {
  const row = {
    original: jsonSchema,
  };

  return render(<SchemaVersion row={row as Row<SchemaSubject>} />);
};

describe('SchemaVersion', () => {
  it('renders versions', async () => {
    renderComponent();
    expect(screen.getAllByRole('cell')).toHaveLength(4);
    expect(screen.queryByTestId('json-viewer')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
  });
});
