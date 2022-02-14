import { render } from 'lib/testHelpers';
import React from 'react';
import TableRenderer, {
  Props,
} from 'components/KsqlDb/Query/renderer/TableRenderer/TableRenderer';
import { screen } from '@testing-library/dom';

const renderComponent = (props: Props) => render(<TableRenderer {...props} />);

describe('TableRenderer', () => {
  it('renders', () => {
    renderComponent({
      table: {
        header: 'Test header',
        columnNames: ['Test column name'],
        values: [['Table row #1'], ['Table row #2']],
      },
    });

    expect(
      screen.getByRole('heading', { name: 'Test header' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Test column name' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Table row #1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('cell', { name: 'Table row #2' })
    ).toBeInTheDocument();
  });
});
