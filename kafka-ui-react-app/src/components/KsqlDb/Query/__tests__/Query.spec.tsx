import { render } from 'lib/testHelpers';
import React from 'react';
import Query from 'components/KsqlDb/Query/Query';
import { screen, within } from '@testing-library/dom';

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
});
