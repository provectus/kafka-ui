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
        values: [['Table row #1'], ['Table row #2'], ['{"jsonrow": "#3"}']],
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

  it('renders with empty arrays', () => {
    renderComponent({
      table: {},
    });

    expect(screen.getByText('No tables or streams found')).toBeInTheDocument();
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

    expect(hasJsonStructure('1')).toBeFalsy();
    expect(hasJsonStructure('{1:}')).toBeFalsy();
    expect(hasJsonStructure('{1:"1"}')).toBeFalsy();

    // @ts-expect-error We suppress error because this function works with unknown data from server
    expect(hasJsonStructure(1)).toBeFalsy();

    expect(hasJsonStructure('{}')).toBeTruthy();
    expect(hasJsonStructure('{"correct": "json"}')).toBeTruthy();

    expect(hasJsonStructure('[]')).toBeTruthy();
    expect(hasJsonStructure('[{}]')).toBeTruthy();

    expect(hasJsonStructure({})).toBeTruthy();
    expect(hasJsonStructure({ correct: 'json' })).toBeTruthy();
  });
});
