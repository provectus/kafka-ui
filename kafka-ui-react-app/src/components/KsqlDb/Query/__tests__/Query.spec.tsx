import { render } from 'lib/testHelpers';
import React from 'react';
import Query from 'components/KsqlDb/Query/Query';
import { screen, waitFor, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

const clusterName = 'testLocal';
const renderComponent = () =>
  render(<Query />, { pathname: `ui/clusters/${clusterName}/ksql-db/query` });

describe('Query', () => {
  it('renders', () => {
    renderComponent();

    const KSQLBlock = screen.getByLabelText('KSQL');
    expect(KSQLBlock).toBeInTheDocument();
    expect(within(KSQLBlock).getByText('KSQL')).toBeInTheDocument();
    expect(
      within(KSQLBlock).getByRole('button', { name: 'Clear' })
    ).toBeInTheDocument();
    // Represents SQL editor
    expect(within(KSQLBlock).getByRole('textbox')).toBeInTheDocument();

    const streamPropertiesBlock = screen.getByLabelText(
      'Stream properties (JSON format)'
    );
    expect(streamPropertiesBlock).toBeInTheDocument();
    expect(
      within(streamPropertiesBlock).getByText('Stream properties (JSON format)')
    ).toBeInTheDocument();
    expect(
      within(streamPropertiesBlock).getByRole('button', { name: 'Clear' })
    ).toBeInTheDocument();
    // Represents JSON editor
    expect(
      within(streamPropertiesBlock).getByRole('textbox')
    ).toBeInTheDocument();

    // Form controls
    expect(screen.getByRole('button', { name: 'Execute' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Stop query' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Clear results' })
    ).toBeInTheDocument();
  });

  it('renders error with empty input', async () => {
    renderComponent();

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );
    expect(screen.getByText('ksql is a required field')).toBeInTheDocument();
  });

  it('renders error with non-JSON streamProperties', async () => {
    renderComponent();

    await waitFor(() =>
      // the use of `paste` is a hack that i found somewhere,
      // `type` won't work
      userEvent.paste(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        'not-a-JSON-string'
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );

    expect(
      screen.getByText('streamsProperties is not JSON object')
    ).toBeInTheDocument();
  });

  it('renders without error with correct JSON', async () => {
    renderComponent();

    await waitFor(() =>
      userEvent.paste(
        within(
          screen.getByLabelText('Stream properties (JSON format)')
        ).getByRole('textbox'),
        '{"totallyJSON": "string"}'
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );

    expect(
      screen.queryByText('streamsProperties is not JSON object')
    ).not.toBeInTheDocument();
  });
});
