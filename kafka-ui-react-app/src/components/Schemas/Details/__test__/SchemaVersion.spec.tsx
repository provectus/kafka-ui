import React from 'react';
import SchemaVersion from 'components/Schemas/Details/SchemaVersion/SchemaVersion';
import { render } from 'lib/testHelpers';
import { SchemaSubject } from 'generated-sources';
import { Row } from '@tanstack/react-table';

import { jsonSchema } from './fixtures';

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
  });
});
