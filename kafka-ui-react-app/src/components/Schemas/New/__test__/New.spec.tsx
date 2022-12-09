import React from 'react';
import New from 'components/Schemas/New/New';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterSchemaNewPath } from 'lib/paths';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const clusterName = 'local';
const subjectValue = 'subject';
const schemaValue = 'schema';

describe('New Component', () => {
  beforeEach(() => {
    waitFor(() => {
      render(
        <WithRoute path={clusterSchemaNewPath()}>
          <New />
        </WithRoute>,
        {
          initialEntries: [clusterSchemaNewPath(clusterName)],
        }
      );
    });
  });

  it('renders component', () => {
    expect(screen.getByText('Create')).toBeInTheDocument();
  });
  it('submit button will be disabled while form fields are not filled', () => {
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    expect(submitBtn).toBeDisabled();
  });
  it('submit button will be enabled when form fields are filled', async () => {
    const subject = screen.getByPlaceholderText('Schema Name');
    const schema = screen.getAllByRole('textbox')[1];
    const schemaTypeSelect = screen.getByRole('listbox');

    await userEvent.type(subject, subjectValue);
    await userEvent.type(schema, schemaValue);
    await userEvent.selectOptions(schemaTypeSelect, ['AVRO']);

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).toBeEnabled();
  });
});
