import { render } from 'lib/testHelpers';
import React from 'react';
import TableRenderer, {
  Props,
  hasJsonStructure,
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

describe('hasJsonStructure', () => {
  it('works', () => {
    expect(hasJsonStructure('simplestring')).toBeFalsy();
    expect(
      hasJsonStructure("{'looksLikeJson': 'but has wrong quotes'}")
    ).toBeFalsy();
    expect(
      hasJsonStructure('{"json": "but doesnt have closing brackets"')
    ).toBeFalsy();
    expect(hasJsonStructure('"string":"that looks like json"')).toBeFalsy();

    expect(hasJsonStructure('{}')).toBeTruthy();
    expect(hasJsonStructure('{"correct": "json"}')).toBeTruthy();
    expect(hasJsonStructure('{"correct": "json"}')).toBeTruthy();
  });
});
