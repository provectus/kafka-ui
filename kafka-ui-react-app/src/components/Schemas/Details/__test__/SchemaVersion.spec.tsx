import React from 'react';
import SchemaVersion from 'components/Schemas/Details/SchemaVersion/SchemaVersion';
import { render } from 'lib/testHelpers';
import { SchemaSubject } from 'generated-sources';
import { Row } from '@tanstack/react-table';

export interface Props {
  row: Row<SchemaSubject>;
}

const renderComponent = () => {
  const row = {
    original: {
      subject: 'Avrotest',
      version: '5',
      id: 106,
      schema:
        '{"type":"record","name":"Student","namespace":"DataFlair","fields":[{"name":"Name","type":"string"},{"name":"Age","type":"int"},{"name":"Aged","type":"int"},{"name":"Ages","type":"int"},{"name":"Ageas","type":"int"},{"name":"Ageasa","type":"int"}]}',
      compatibilityLevel: 'BACKWARD',
      schemaType: 'AVRO',
    },
  };

  return render(<SchemaVersion row={row as Row<SchemaSubject>} />);
};

describe('SchemaVersion', () => {
  it('renders versions', () => {
    renderComponent();
  });
});
